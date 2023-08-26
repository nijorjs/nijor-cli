const {join} = require('path');
const RootPath = process.cwd();

module.exports = async function(NijorConfigFile){

    if(!(fs.existsSync(NijorConfigFile))){
        console.print(`The file 'nijor.config.json' doesn't exist. So, Nijor Compiler can't build your project.`,[255,251,14]);
    }else{
        const {GenerateStaticSite} = require('../tools/StaticSiteGenerator.js');
        const dir = join(RootPath,NijorConfigFile.ssg.dir);
        const template = join(RootPath,NijorConfigFile.app,'index.html');
        const script = join(RootPath,NijorConfigFile.module.output);
        await GenerateStaticSite(dir,template,script);
    }
}