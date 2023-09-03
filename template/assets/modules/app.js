function getAttributes(el) {
    /*
    This function returns the key-value-pair of an HTML element.
    Example: 
        HTML: <card name="Test" price="Test"></card>
        JS: document.getElementsByName('card')[0].getAttributes; will return {name:'Test',price:'Test'}
    */
    let nodes = [], values = [];
    for (let att, i = 0, atts = el.attributes, n = atts.length; i < n; i++) {
        att = atts[i];
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
    }
    nodes.push('_text_');
    values.push(el.innerHTML);
    let keys = nodes;
    let Values = values;
    let allAttributes = {};
    keys.forEach((key, i) => allAttributes[key] = Values[i]);
    return (allAttributes);
}class component{
    constructor(template,callback) {
        this.template = template;
        this.cb = callback;
    }
    init(name){
        this.name = name;
    }
    run = async function(urlParameters){
        let to_be_replaced = new RegExp(`(<${this.name}[^>]+>|<${this.name}>)`);
        let element = document.getElementsByTagName(this.name)[0];
        if(document.getElementsByTagName(this.name).length===0) return;
        let allSpecs = getAttributes(element);
        if(urlParameters!=null) allSpecs = urlParameters;
        try { element.innerHTML=""; } catch (error) {} 
        try {
            let result = await this.template(allSpecs);
            element.parentElement.innerHTML = element.parentElement.innerHTML.replace(to_be_replaced,result);
            await this.cb(allSpecs);
            await this.run();
        } catch (error) {
            let result = await this.template(allSpecs);
            document.body.innerHTML = document.body.innerHTML.replace(to_be_replaced,result);
            await this.cb(allSpecs);
            await this.run();
        }
    }
}

const Handler = {
    set(target,prop,receiver){
        target[prop] = receiver;

        document.querySelectorAll(`nirev[var="${prop}"]`).forEach(el=>{
            el.innerHTML = receiver;
        });

        return true;
    }
};

var reactiveVars = new Proxy({},Handler);

// window.nijor is an object used by Nijor during runtime.
// window.nijorfunc is an object that stores all the events like on:click="clicked()" (on:{event}="func()") 
window.nijor={ component, reactiveVars };
window.nijor.hashRouterActivated = false;
window.nijorfunc={};

window.location.query = function(){
    // this function returns the url parameters.
    let params = {};
    let parser = document.createElement('a');
    parser.href = window.location.href;
    let query = parser.search.substring(1);
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

window.nijor.emitEvent = async function(eventName,data={}){
    document.querySelectorAll('[on'+eventName+']').forEach(element=>{
        if(element.getAttribute('id')===null){
            element.setAttribute('id','id_'+makeid(4,6));
        }
        let regexRoundBraces = /\((.*)\)/;
        let EventNameCalled = element.getAttribute('on'+eventName);
        let EventName = EventNameCalled.split('(')[0];
        let args = EventNameCalled.match(regexRoundBraces)[1];
        args = args.replace('$data',JSON.stringify(data));
        args = args.replace('this','_this');
        let EvaluationString= new Function(`
        let _this = document.getElementById('${element.id}');
        ${EventName}(${args});
        `);
        EvaluationString();
    });
};

window.nijor.reload = async function(eventName){
    await window.nijor.emitEvent('reload'+eventName,null);
};

function makeid(min,max){
    let length = Math.floor(Math.random() * (max - min + 1) + min);
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

window.nijor.routes = new Map();
window.nijor.routes.set("/",()=>{});

window.nijor.slots = new Map();
window.nijor.slots.set("/",()=>{});

window.nijor.redirect = function(route){
    window.nijor.previousRoute=window.location.pathname;
    try {
        history.pushState(null,null,route);
        history.pushState(null,null,route);
        history.back();
    } catch (error) {
        window.location.href=route;
    }
    return false;
};

window.addEventListener('popstate',async e =>{
    let path = e.target.location.pathname;

    await window.nijor.renderRoute(path);

    window.nijor.previousRoute = path;
    window.nijor.emitEvent('route',window.location.pathname);
});

window.nijor.setRoute = function(url,DynamicComponent,parentURL){
    window.nijor.routes.set(url,async(urlParameters)=>{
        try{
            let { default: Page} = await(DynamicComponent());
            let routesDiv = document.getElementById(`routes-slot-${parentURL}`);
            if(routesDiv){
                routesDiv.innerHTML="<app></app>";
            }else {
                await window.nijor.slots.get(`${parentURL}`)();
                document.getElementById(`routes-slot-${parentURL}`).innerHTML="<app></app>";
            }
            Page.init('app');
            await Page.run(urlParameters);
        }catch(e){} 
    });
};

window.nijor.addSlot = function(url,DynamicComponent){
    window.nijor.slots.set(url,async()=>{
        try{
            let { default: Page} = await(DynamicComponent());
            let routesDiv = document.getElementById('routes-slot-/');
            if(routesDiv){
                routesDiv.innerHTML="<app></app>";
            }
            Page.init('app');
            await Page.run();
        }catch(e){console.log(e);} 
    });
};

async function RenderRoutes(route){
    if(route.endsWith('/') && route!="/") route = route.substring(0, route.length-1); // convert /route/ to /route
    if(route.endsWith('.html')) {
        route = route.slice(0, -5); // convert /route.html to /route
        history.replaceState(null,null,route); // replace /route.html to /route in the address bar

    }
    if(window.nijor.routes.has(route)) return await window.nijor.routes.get(route)();
    return await RenderRouteWithVars(route,window.nijor.routes);
}

async function RenderSlots(route){
    if(route.endsWith('/') && route!="/") route = route.substring(0, route.length-1); // convert /route/ to /route
    if(window.nijor.slots.has(route)) return await window.nijor.slots.get(route)();
}

async function RenderRouteWithVars(url, map) {
    for (const [route,page] of map.entries()) {
        if(route instanceof RegExp){
            const res = route.exec(url);
            if (!res) continue;
            let vars = res.slice(1,res.length);
            if(vars[0].indexOf('/')>-1) continue;
            return await page(vars);
        }
    }
    await Render404(url);
}

async function Render404(route){
    if(route==="/") return;
    let fragments = route.split('/');
    if(fragments[fragments.length - 1]==="404") fragments.pop();
    fragments.pop();
    fragments.push('404');
    route = fragments.join('/');
    if(route.endsWith('/') && route!="/") route = route.substring(0, route.length-1);
    if(window.nijor.routes.has(route)) return await window.nijor.routes.get(route)();
    return await Render404(route);
}

window.nijor.renderRoute = RenderRoutes;
window.nijor.renderSlots = RenderSlots;

var img = "data:image/svg+xml,%3c!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 20010904//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3e%3csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='150px' height='150px' viewBox='0 0 1500 1500' preserveAspectRatio='xMidYMid meet'%3e%3cg id='layer101' fill='%2300a2e8' stroke='none'%3e %3cpath d='M150 1397 c0 -8 -5 -17 -11 -19 -7 -2 21 -200 80 -567 50 -310 91 -568 91 -572 0 -5 6 -9 12 -9 7 0 178 165 380 367 l368 368 1 -360 1 -360 99 -94 c55 -52 102 -91 105 -88 10 10 -157 1131 -169 1139 -7 4 -16 8 -22 8 -5 0 -175 -165 -377 -367 l-368 -368 -1 380 -1 380 -94 89 c-54 51 -94 82 -94 73z'/%3e %3c/g%3e%3cg id='layer102' fill='%230ec4f8' stroke='none'%3e %3cpath d='M703 838 l-363 -363 0 -120 0 -120 365 365 366 366 -3 117 -3 117 -362 -362z'/%3e %3c/g%3e%3c/svg%3e";

var $header = new window.nijor.component(async function(){
                  
                  return(`<div class="container" n-scope="UrotQR030">
        <a n-scope="UrotQR030" onclick="return window.nijor.redirect(this.href)" href="/"><img src="${img}" n-scope="UrotQR030"></a>
        <div class="nav-bar" n-scope="UrotQR030">
            <a href="https://nijorjs.github.io/docs" class="nav-link" n-scope="UrotQR030">Docs</a>
        </div>
    </div>
`);
              },async function(){
                
                
                
                
            });

var $footer = new window.nijor.component(async function(){
                  
                  return(`<div n-scope="HL8cC6OujwrnXiKl6Pl">
        <p n-scope="HL8cC6OujwrnXiKl6Pl">Nijor Template Website</p>
    </div>
`);
              },async function(){
                
                
                
                
            });

var App = new window.nijor.component(async function(){
                  
                  return(`<headerdks0 n-scope="09EtCONX7EqRsVuDU"></headerdks0>
        <div style="margin-top: 5rem;" id="routes-slot-/" n-scope="09EtCONX7EqRsVuDU"></div>
    <footerdks0 n-scope="09EtCONX7EqRsVuDU"></footerdks0>
`);
              },async function(){
                
                
              $header.init('headerdks0');
              await $header.run();
            
              $footer.init('footerdks0');
              await $footer.run();
            
                
                
            });

window.nijor.setRoute('/404',()=>import('./404-48f2a2c4.js'),'/');
window.nijor.setRoute('/',()=>import('./index-72091313.js'),'/');
window.nijor.setRoute('/welcome',()=>import('./welcome-c88aa581.js'),'/');


App.init('app');
App.run();
window.nijor.renderRoute(window.location.pathname);

export { img as i };
