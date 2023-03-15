#!/usr/bin/env node

require('dotenv').config();
const path = require('path');
const chalk = require('chalk');
const userArgs = process.argv.slice(2);
const createProject = require('../src/create.js');
const cloneProject = require('../src/clone.js');
const buildProject = require('../src/build.js');
const compileProject = require('../src/compile.js');
const serveProject = require('../src/serve.js');
const cwDir = process.cwd();
const NijorConfigFile = path.join(cwDir,'nijor.config.json');
const TemplateDirectory = path.join(path.dirname(__dirname),'template');

console.print = (txt,[r,g,b])=>console.log(chalk.rgb(r, g, b)(txt)); // For colorful logs on the console

const commandsMap = {
    "create": () => createProject(cwDir,TemplateDirectory,userArgs[1]),
    "clone": () => cloneProject(cwDir,userArgs[1],userArgs[2]),
    "build": ()=> buildProject(NijorConfigFile),
    "compile": ()=> compileProject(NijorConfigFile,userArgs[1]),
    "serve": ()=> serveProject(),
    "-v": ()=> console.log(process.env.VERSION),
    "default": ()=> DefaultCommand()
}

function DefaultCommand(){
    console.print("Welcome to the Nijor CLI !",[0,195,255]);
    console.print("version : process.env.VERSION",[0,195,255]);
}

try {
    commandsMap[userArgs[0]]();
} catch (error) {
    commandsMap['default']();
}