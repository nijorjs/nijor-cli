const http = require('http');
const fs = require('fs');
const path = require('path');
const rootDir = process.cwd();
const DefaultNijorConfigServer = {
    server:{
        port : 3000,
        appdir : 'app'
    }
};
const NijorJSON = require(path.join(rootDir,'nijor.config.json')) || DefaultNijorConfigServer;
const staticDir = path.join(rootDir);
const hostname = '127.0.0.1';
const port = NijorJSON.server.port;

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
            let data = fs.existsSync(staticDir + req.url+'.html') ?  fs.readFileSync(staticDir + req.url+'.html') : fs.readFileSync(path.join(staticDir,'index.html'),'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
});

server.listen(port, hostname, () => {
    console.print(`Server running at http://${hostname}:${port}`,[0,195,255]);
});