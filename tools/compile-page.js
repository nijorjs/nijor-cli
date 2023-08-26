const { JSDOM } = require('jsdom');
const { dirname, resolve } = require('path');
const { existsSync, readFileSync } = require('fs');
const fetch = require('node-fetch');

const getBundlePath = script => resolve(dirname(script), '__ssr-bundle.js');

async function CompilePage(template, script, url, ssr=false) {
    const {
        host,
        eventName,
        inlineDynamicImports,
        timeout,
        dev,
    } = {
        host: 'http://nijorjs.ssr',
        eventName: 'app-loaded',
        silent: false,
        inlineDynamicImports: true,
        timeout: 5000,
        dev: false
      };

    template = existsSync(template) ? readFileSync(template, 'utf8') : template ;
    script = inlineDynamicImports ? await inlineScript(script, dev) : isFile(script) ? readFileSync(script, 'utf8') : script;


    return new Promise(async (resolve, reject) => {
        try {
            const dom = await new JSDOM(template, { runScripts: "outside-only", url: host + url });
            
            shimDom(dom);

            if (eventName) {
                const eventTimeout = setTimeout(() => {
                    if (dom.window._document) {
                        resolveHtml();
                    }
                }, timeout);
                dom.window.addEventListener(eventName, resolveHtml);
                dom.window.addEventListener(eventName, () => clearTimeout(eventTimeout));
            }

            dom.window.eval(script);

            if (!eventName)resolveHtml();

            function resolveHtml() {
                let html = dom.serialize();
                if(!ssr){
                    dom.window.document.body.querySelectorAll(`a[onclick="return window.nijor.redirect(this.href)"]`).forEach(tag=>{
                        tag.removeAttribute('onclick');
                        let href = tag.getAttribute('href')
                        href = href === "/" ? "index" : href;
                        tag.setAttribute('href',href+'.html');
                    });
                html = dom.serialize();
                }
                resolve(html);
                dom.window.close();
            }

        } catch (err) { };
    })
}

async function inlineScript(script, dev = false) {
    const bundlePath = getBundlePath(script);

    if (!existsSync(bundlePath) || dev) {
        const { build } = require('esbuild');
        await build({ entryPoints: [script], outfile: bundlePath, bundle: true });
    }
    return readFileSync(bundlePath, 'utf-8');
}

function shimDom(dom) {
    dom.window.rendering = true;
    dom.window.alert = (_msg) => { };
    dom.window.scrollTo = () => { };
    dom.window.requestAnimationFrame = () => { };
    dom.window.cancelAnimationFrame = () => { };
    dom.window.TextEncoder = TextEncoder;
    dom.window.TextDecoder = TextDecoder;
    dom.window.fetch = fetch;
}

function isFile(str) {
    const hasIllegalPathChar = str.match(/[<>:"|?*]/g);
    const hasLineBreaks = str.match(/\n/g);
    const isTooLong = str.length > 4096;
    const isProbablyAFile = !hasIllegalPathChar && !hasLineBreaks && !isTooLong;
    const exists = existsSync(str);
    if (isProbablyAFile && !exists) console.log(`The script "${str}" looks like a filepath, but the file didn't exist`);
    return exists;
}

module.exports = CompilePage ;