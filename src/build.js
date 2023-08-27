const fs = require('fs');
const path = require('path');
const RootPath = process.cwd();

module.exports = async function(NijorConfigFilePath){
    
    if(!(fs.existsSync(NijorConfigFilePath))){
        console.print(`The file 'nijor.config.json' doesn't exist. So, Nijor Compiler can't build your project.`,[255,251,14]);
    }else{
      const NijorConfigFile = require(NijorConfigFilePath);

      const compileNijorFiles = require('../tools/compiler.js');
      await compileNijorFiles({minify:true});

      fs.rmSync(NijorConfigFile.app.dir, { recursive: true, force: true }); // Delete the build folder from the cwd

      if(NijorConfigFile.app.type==="ssr"){
        const GenerateStaticSite = require('../tools/StaticSiteGenerator.js');
        const dir = path.join(RootPath,NijorConfigFile.app.dir);
        const template = path.join(RootPath,'index.html');
        const script = path.join(RootPath,NijorConfigFile.module.output,'app.js');
        await GenerateStaticSite(dir,template,script);
        copyRecursiveSync(path.join(RootPath,'assets'),path.join(dir,'assets'));
      }

    }

}

function copyRecursiveSync(src, dest) {
    let exists = fs.existsSync(src);
    let stats = exists && fs.statSync(src);
    let isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      if(!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(path.join(src, childItemName),path.join(dest, childItemName));
      });
    } else { fs.copyFileSync(src, dest); }
}