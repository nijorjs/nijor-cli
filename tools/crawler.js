const fs = require('fs').promises;
const path = require('path');
let Code = "";
let Files = [];
let Slots  = ['/'];
let serverRoutes = new Map();

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

function Convert2Regex(route){
    // let regexpForAngularBrackets =  /<(.*?)>/g ;
    let regexpForSquareBrackets =  /\[(.*?)\]/g ;

    let allVars = route.match(regexpForSquareBrackets);
    
    allVars.forEach(el => {
        route = route.replace(el,'(.*)');
    });

    return new RegExp(route);
    // :  <(.*?)>
    // :  \/docs\/(.*)\/(.*)\/
}

function getRouteFromFilePath(filepath){
    filepath = filepath.replace(/\\/g,'/');
    let route = '/'+filepath.split('src/pages/')[1].replace('.nijor','');
    if(route.endsWith('/') && route!="/") route = route.substring(0, route.length-1);
    const fragments = route.split('/');
    const lastFragment = fragments[fragments.length-1];
    let url = '';
    let parentURL = ''; 

    if(fragments.length > 1 && lastFragment==="index") fragments.pop();
    url = fragments.join('/') || '/';

    Slots.forEach(item=>{
        if(url.indexOf(item)>-1){
            parentURL = item;
        }
    });

    if(url.match(/\[(.*?)\]/)!=null) url = Convert2Regex(url);
    else url = `'${url}'`;

    return {url,parentURL};
}

function AddRoute(filepath){
    let {url,parentURL} = getRouteFromFilePath(filepath);

    serverRoutes.set(url,filepath.replace(path.join(process.cwd(),'src/pages/'),'').replace('.nijor','.html'));

    Code += `window.nijor.setRoute(${url},()=>import('${filepath.replace(/\\/g,'/')}'),'${parentURL}');\n`;
}

async function AddSlot(filepath){
    let {url} = getRouteFromFilePath(filepath);
    Slots.push(url.replace(/'/g,''));
    Code += `window.nijor.addSlot(${url},()=>import('${filepath.replace(/\\/g,'/')}'));`;
}

module.exports.crawl = async directory =>{

    await crawlDirectory(path.join(directory,'pages'));
    Files.forEach(file=>{
        AddRoute(file);
    });

    global.Slots = Slots;

    let App = await fs.readFile(path.join(directory,'App.js'),'utf-8');
    App = App.replace('//@Routes()',Code);

    global.serverRoutes = serverRoutes;

    return App;
}