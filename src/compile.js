const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

module.exports = async function(NijorConfigFile,watch){
    
    if(!(fs.existsSync(NijorConfigFile))){
        console.print(`The file 'nijor.config.json' doesn't exist. So, Nijor Compiler can't build your project.`,[255,251,14]);
    }else{
        const compileNijorFiles = require('../tools/compiler.js');
        await compileNijorFiles({minify:false});
        // Watch for changes in the src folder
        if(watch==="-watch" || watch==="-w"){
            const watcher = chokidar.watch(path.join(process.cwd(),'src'));
            console.print('Watching for changes in the src/ folder .....',[64,226,73]);
            watcher.on('change',async _=> {
                await compileNijorFiles({minify:true});
                console.print('Watching for changes in the src/ folder .....',[64,226,73]);
            });
        }
    }

}