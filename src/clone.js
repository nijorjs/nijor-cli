const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

module.exports = async function(cwDir,name,url){

    console.print("Creating your project ...",[255,251,14]);

    let dir = path.join(cwDir,name);
    await git.clone({ fs, http, dir, url: url });
    fs.rmSync(path.join(dir,'.git'), { recursive: true, force: true });

    console.print("Created your project successfuly !",[0,195,255]);

}