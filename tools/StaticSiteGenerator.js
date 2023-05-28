const CompilePage = require('./compile-page.js');
const fs = require('fs');
const path = require('path');
let Files = [];

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
    else url = `'${url}'`;
    return url;
}

async function crawlDirectory(directoryPath) {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile() && path.basename(filePath)!=".nijor") Files.push(filePath);
      if (stats.isFile() && path.basename(filePath)==".nijor") AddSlot(filePath);
      else if (stats.isDirectory()) await crawlDirectory(filePath);
    }
}

async function getAllRoutes(){
    let Routes = [];
    await crawlDirectory(path.join(directory,'pages'));
    Files.forEach(file=>{
        Routes.push(getRouteFromFilePath(file));
    });
    return Routes;
}

async function GenerateStaticSite(dir,template,script){
    let urls = getAllRoutes();
    for(let url of urls){
        let content = await CompilePage(template, script, url);
        url = url==="/" ? "index" : url;
        ensureDirectoryExistence(path.join(dir,url+'.html'));
        fs.writeFileSync(path.join(dir,url+'.html'),content);
    }
}