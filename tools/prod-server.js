const http = require('http');
const fs = require('fs');
const path = require('path');
const rootDir = process.cwd();
const staticDir = path.join(rootDir);
const hostname = '127.0.0.1';
const port = 3000;
let routes = require('./routes.js');

const server = http.createServer((req, res) => {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        };

        if(req.url=="/index.html"){
            res.writeHead(302,{location:'/'});
            res.end();
            return;
        }
        try {
            let data = fs.readFileSync(staticDir + req.url);
            if (path.extname(req.url)==='.svg') {
                res.setHeader('Content-Type', 'image/svg+xml');
            }
            if (path.extname(req.url)==='.ico') {
                res.setHeader('Content-Type', 'image/vnd.microsoft.icon');
            }
            if (path.extname(req.url)==='.js') {
                res.setHeader('Content-Type', 'application/javascript');
            }

            res.writeHead(200,headers);
            res.end(data);
        } catch (error) {
            let data = fs.existsSync(path.join(staticDir,req.url+'.html')) ?  fs.readFileSync(path.join(staticDir,req.url+'.html')) : HandleParametizedRoutes(req.url);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
});

server.listen(port, hostname, () => {
    console.log(`\x1b[34mServer running at http://${hostname}:${port}`);
});


function HandleParametizedRoutes(url){
    return RenderRouteWithVars(url,routes);
}
function RenderRouteWithVars(url, map) {
    for (const [route,page] of map.entries()) {
        if(route instanceof RegExp){
            const res = route.exec(url);
            if (!res) continue;
            let vars = res.slice(1,res.length);
            if(vars[0].indexOf('/')>-1) continue;
            
            let data = fs.readFileSync(path.join(staticDir,page),'utf-8');
            data = data.replace(/\[(.*?)\]/g,vars[0]);
            return data;
        }
    }
    return fs.readFileSync(path.join(staticDir,'index.html'));
}