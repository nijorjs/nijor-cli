const CompilePage = require('./compile-page.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
let Files = [];

const RootPath = process.cwd();

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function getRouteFromFilePath(filepath){
    filepath = filepath.replace(/\\/g,'/');
    let route = '/'+filepath.split('src/pages/')[1].replace('.nijor','');
    if(route.endsWith('/') && route!="/") route = route.substring(0, route.length-1);
    const fragments = route.split('/');
    const lastFragment = fragments[fragments.length-1];
    let url = '';
    if(fragments.length > 1 && lastFragment==="index") {
        fragments.pop();
        url = fragments.join('/') || '/';
    }else{
        url = fragments.join('/') || '/';
    }
    
    if(url.match(/\[(.*?)\]/)!=null) url = Convert2Regex(url);
    else url = `${url}`;
    return url;
}

async function crawlDirectory(directoryPath) {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isFile() && path.basename(filePath)!=".nijor") Files.push(filePath);
      if (stats.isFile() && path.basename(filePath)==".nijor") AddSlot(filePath);
      else if (stats.isDirectory()) await crawlDirectory(filePath);
    }
}

async function getAllRoutes(directory){
    let Routes = [];
    await crawlDirectory(path.join(directory,'pages'));
    Files.forEach(file=>{
        Routes.push(getRouteFromFilePath(file));
    });
    return Routes;
}

module.exports = async function GenerateStaticSite(dir,template,script){
    console.log(chalk.rgb(255, 243, 18)(`This process may take a few minutes. So please be patient.`));
    let urls = getAllRoutes(path.join(RootPath,'src'));
    for(let url of await urls){
        let content = await CompilePage(template, script, url);
        url = url==="/" ? "index" : url;
        ensureDirectoryExistence(path.join(dir,url+'.html'));
        fs.writeFileSync(path.join(dir,url+'.html'),content);
        console.log(chalk.rgb(0, 195, 255)("Nijor: ")+chalk.rgb(44, 255, 2)(`Wrote ${url.replace('/','')+'.html'}`));
    }
    console.log(chalk.rgb(0, 195, 255)("Build all pages successfully !"));
}