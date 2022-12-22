const fs = require('fs');
const path = require('path');

module.exports = async function(cwDir,TemplateDirectory,name){

    if(!name){
      console.print("{name} missing in 'nijor create {name}'",[255,251,14]);
      return;
    }
    
    console.print("Creating your project ...",[255,251,14]);
    
    let dir = path.join(cwDir,name);
    copyRecursiveSync(TemplateDirectory,dir);
    
    { // Change the value of app.name in the Nijor COnfiguration File
      let nijorConfigFile = require(path.join(dir,'nijor.config.json'));
      nijorConfigFile.app.name = name;
      fs.writeFile(path.join(dir,'nijor.config.json'), JSON.stringify(nijorConfigFile,null,4),()=>{});
    }
    

    console.print("Copying the files ...",[255,251,14]);

    console.print("Created your project successfuly !",[0,195,255]);

}

function copyRecursiveSync(src, dest) {
    let exists = fs.existsSync(src);
    let stats = exists && fs.statSync(src);
    let isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(path.join(src, childItemName),path.join(dest, childItemName));
      });
    } else { fs.copyFileSync(src, dest); }
}