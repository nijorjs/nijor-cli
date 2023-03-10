const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const includePaths = require('rollup-plugin-includepaths');
const sass = require('sass');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const cjs = require('@rollup/plugin-commonjs');
const image = require('@rollup/plugin-image');
const terser = require('@rollup/plugin-terser');
const nijor = require('@nijor/nijor');
const NijorCompiler = require('@nijor/nijor-rollup-plugin');
const RootPath = process.cwd();
const srcPath = path.join(RootPath,'src');

const NijorJSON = require(path.join(RootPath,'nijor.config.json'));

const includePathOptions = {
    include: nijor,
    paths: [srcPath],
    external: [],
    extensions: ['.js','.nijor','.svg','.jpg','.png']
};
function Style(style){
    let cssStyle = sass.renderSync({
        data:style,
        outputStyle:'compressed'
    });
    return cssStyle.css.toString();
}
const compilerOptions = {
    styleSheet: path.join(RootPath,NijorJSON.styles.output),
    Style,
    rootdir: __dirname
}
const inputOptions = {
    input: path.join(RootPath,NijorJSON.module.input),
    preserveEntrySignatures : false,
    plugins:[
        includePaths(includePathOptions),
        nodeResolve(),
        cjs(),
        NijorCompiler(compilerOptions),
        image()
    ]
};
const outputOptions = {
    dir: path.join(RootPath,NijorJSON.module.output),
    format:'es',
};

async function build(options) {
    const cssStyle = sass.renderSync({file:path.join(RootPath,NijorJSON.styles.input),outputStyle:'compressed'});
    globalStyles = cssStyle.css.toString();
    fs.writeFileSync(compilerOptions.styleSheet,globalStyles);

    if(options.minify === true){
        inputOptions.plugins.push(terser());
    }

    console.log(`Nijor: Compiling the files.`);

    try {
        fs.rmSync(outputOptions.dir, { recursive: true, force: true }); // Delete the modules folder from app/assets
    } catch (error) {}

    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
    await bundle.close();

    console.log(`Nijor: Compiled all files successfully.`);
}

module.exports = build;

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
          let curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
      }
}