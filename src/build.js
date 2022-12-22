const fs = require('fs');
module.exports = async function(NijorConfigFile){
    
    if(!(fs.existsSync(NijorConfigFile))){
        console.print(`The file 'nijor.config.json' doesn't exist. So, Nijor Compiler can't build your project.`,[255,251,14]);
    }else{
        const compileNijorFiles = require('../tools/compiler.js');
        await compileNijorFiles({minify:true});
    }

}