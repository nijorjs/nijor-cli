const fs = require('fs');
const {join} = require('path');
const RootPath = process.cwd();

module.exports = async function(NijorConfigFilePath){

    if(!(fs.existsSync(NijorConfigFilePath))){
        console.print(`The file 'nijor.config.json' doesn't exist. So, Nijor Compiler can't build your project.`,[255,251,14]);
    }else{
        const NijorConfigFile = require(NijorConfigFilePath);
        const GenerateStaticSite = require('../tools/StaticSiteGenerator.js');
        const dir = join(RootPath,NijorConfigFile.ssg.dir);
        const template = join(RootPath,NijorConfigFile.server.appdir,'index.html');
        const script = join(RootPath,NijorConfigFile.module.output,'app.js');
        await GenerateStaticSite(dir,template,script);
    }
}