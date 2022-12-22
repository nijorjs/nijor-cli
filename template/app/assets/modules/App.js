class component{
    constructor(template,callback) {
        this.template = template;
        this.cb = callback;
    }
    init(name){
        this.name = name;
    }
    run = async function(){
        let to_be_replaced = new RegExp(`(<${this.name}[^>]+>|<${this.name}>)`);
        let element = document.getElementsByTagName(this.name)[0];
        if(document.getElementsByTagName(this.name).length===0) return;
        let allSpecs = element.getAttributes();
        try {
            element.innerHTML="";
        } catch (error) {} 
        try {
            let result = await this.template(allSpecs);
            element.parentElement.innerHTML = element.parentElement.innerHTML.replace(to_be_replaced,result);
            await this.cb();
            this.run();
        } catch (error) {
            let result = await this.template(allSpecs);
            document.body.innerHTML = document.body.innerHTML.replace(to_be_replaced,result);
            await this.cb();
            this.run();
        }
    }
}

// window.nijor is an object used by Nijor during runtime.
// window.nijorfunc is an object that stores all the events like on:click="clicked()" (on:{event}="func()") 
window.nijor={ component };
window.nijorfunc={};

Object.prototype.getAttributes = function () {
    /*
    This function returns the key-value-pair of an HTML element.
    Example: 
        HTML: <card name="Test" price="Test"></card>
        JS: document.getElementsByName('card')[0].getAttributes; will return {name:'Test',price:'Test'}
    */
    let el = this;
    let nodes = [], values = [];
    for (let att, i = 0, atts = el.attributes, n = atts.length; i < n; i++) {
        att = atts[i];
        nodes.push(att.nodeName);
        values.push(att.nodeValue);
    }
    nodes.push('_text_');
    values.push(this.innerHTML);
    let keys = nodes;
    let Values = values;
    let allAttributes = {};
    keys.forEach((key, i) => allAttributes[key] = Values[i]);
    return (allAttributes);
};

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



window.nijor.routes = {
    "/": () => { },
    "*": () => { }
};

window.nijor.hashroutes = {};

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

window.nijor.renderRoute = async function(url){
    try{
        await window.nijor.routes[url]();
    }
    catch(e){
        await window.nijor.routes["*"]();
    }
    window.nijor.previousRoute = window.location.pathname;
};

window.nijor.renderHashRoute = async function(path,hash){
    try {
        await window.nijor.hashroutes[path][hash]();
    } catch (e) {
        try {
            await window.nijor.hashroutes[path]['*']();
        } catch (error) {}
    }
};

window.addEventListener('hashchange',async function(){
    let hash = window.location.hash;
    let path = window.location.pathname;
    window.nijor.previousRoute = window.location.pathname;
    if (hash === "" || hash === "#") {
        hash = "#";
    }
    await window.nijor.renderHashRoute(path,hash);
    window.nijor.emitEvent('navigate',{path,hash});
});

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

window.addEventListener('popstate',async e =>{
    let path = e.target.location.pathname;

    if(path.indexOf(':')>-1){
    path = path.split(':')[1];
    }

    let hash = e.target.location.hash;
    if (hash === "" || hash === "#") {
        hash = "#";
    }
    if(path===window.nijor.previousRoute){
        await window.nijor.renderHashRoute(window.nijor.previousRoute,hash);
        return;
    }
    await window.nijor.renderRoute(path);
    await window.nijor.renderHashRoute(path,hash);
    window.nijor.previousRoute = path;
});

var img = "data:image/svg+xml,%3c!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 20010904//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3e%3csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='150px' height='150px' viewBox='0 0 1500 1500' preserveAspectRatio='xMidYMid meet'%3e%3cg id='layer101' fill='%2300a2e8' stroke='none'%3e %3cpath d='M150 1397 c0 -8 -5 -17 -11 -19 -7 -2 21 -200 80 -567 50 -310 91 -568 91 -572 0 -5 6 -9 12 -9 7 0 178 165 380 367 l368 368 1 -360 1 -360 99 -94 c55 -52 102 -91 105 -88 10 10 -157 1131 -169 1139 -7 4 -16 8 -22 8 -5 0 -175 -165 -377 -367 l-368 -368 -1 380 -1 380 -94 89 c-54 51 -94 82 -94 73z'/%3e %3c/g%3e%3cg id='layer102' fill='%230ec4f8' stroke='none'%3e %3cpath d='M703 838 l-363 -363 0 -120 0 -120 365 365 366 366 -3 117 -3 117 -362 -362z'/%3e %3c/g%3e%3c/svg%3e";

var $header = new window.nijor.component(async function(){
                  
                  return(`<div class="container" n-scope="mDPQeQSMj">
        <a n-scope="mDPQeQSMj" onclick="return window.nijor.redirect('/')" href="/"><img src="${img}" n-scope="mDPQeQSMj"></a>
        <div class="nav-bar" n-scope="mDPQeQSMj">
            <a href="https://github.com/nijor" class="nav-link" n-scope="mDPQeQSMj">Docs</a>
        </div>
    </div>
`);
              },async function(){
                
                
                
                
            });

var $footer = new window.nijor.component(async function(){
                  
                  return(`<div n-scope="lDRke0S">
        <p n-scope="lDRke0S">Nijor Template Website</p>
    </div>
`);
              },async function(){
                
                
                
                
            });

var App = new window.nijor.component(async function(){
                  
                  return(`<header4xluj n-scope="CZ8uaiv2L"></header4xluj>
        <div id="n-routes" n-scope="CZ8uaiv2L"></div>
    <footer4xluj n-scope="CZ8uaiv2L"></footer4xluj>
`);
              },async function(){
                
                
              $header.init('header4xluj');
              await $header.run();
            
              $footer.init('footer4xluj');
              await $footer.run();
            
                
                
            });

var Index = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="rqUtShO8LujRL6kB4pOO">
        <img src="${img}" n-scope="rqUtShO8LujRL6kB4pOO">
        <p n-scope="rqUtShO8LujRL6kB4pOO">
            <span style="font-size: 35px; font-weight: bold;" n-scope="rqUtShO8LujRL6kB4pOO">Nijor</span>
            <span class="tagline" n-scope="rqUtShO8LujRL6kB4pOO"> : A modern and practical web framework !</span>
        </p>
        <a n-scope="rqUtShO8LujRL6kB4pOO" onclick="return window.nijor.redirect('/welcome')" href="/welcome"><button n-scope="rqUtShO8LujRL6kB4pOO">Get Started</button></a>
    </div>
`);
              },async function(){
                
                
                
                
            });

var Welcome = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="ikCcw4ZZGPrt7KUxU">
        <img src="${img}" n-scope="ikCcw4ZZGPrt7KUxU">
        <span class="welcome-msg" n-scope="ikCcw4ZZGPrt7KUxU"> Welcome to the world of Nijor !</span>
        <p n-scope="ikCcw4ZZGPrt7KUxU">Edit the src/ folder to reflect changes in this website !</p>
    </div>
`);
              },async function(){
                
                
                
                
            });

var Error404 = new window.nijor.component(async function(){
                  
                  return(`<div n-scope="zQt7uCJB5gzhwKLvKp">
        <h1 n-scope="zQt7uCJB5gzhwKLvKp">404 Not found!</h1>
        <p n-scope="zQt7uCJB5gzhwKLvKp">It seems as if the page you are looking for is under construction or not found. <br n-scope="zQt7uCJB5gzhwKLvKp">
        Please go to the <a n-scope="zQt7uCJB5gzhwKLvKp" onclick="return window.nijor.redirect('/')" href="/">Home</a> page.
        </p>
    </div>
`);
              },async function(){
                
                
                
                
            });

class Router{
    
    constructor(routesDiv){
        this.routesDiv = routesDiv;
        this.preRenderfn = function(){};
        this.postRenderfn = function(){};
    }

    preRender(fn){
        this.preRenderfn = function () {
            try { fn(); } catch (error) {}
        };
    }

    postRender(fn){
        this.postRenderfn = function () {
            try { fn(); } catch (error) {}
        };
    }

    route(url,Page){
        window.nijor.routes[url] = async()=>{
            this.preRenderfn();
            document.querySelector(this.routesDiv).innerHTML="<app></app>";
            Page.init('app');
            await Page.run();
            this.postRenderfn();
        };
        window.nijor.routes[url+'/'] = async()=>{
            this.preRenderfn();
            document.querySelector(this.routesDiv).innerHTML="<app></app>";
            Page.init('app');
            await Page.run();
            this.postRenderfn();
        };
    }

    lazyroute(url,DynamicComponent,fallbackPage){
        window.nijor.routes[url] = async()=>{
            try {
                let { default: Page} = await(DynamicComponent());
                this.preRenderfn();
                document.querySelector(this.routesDiv).innerHTML="<app></app>";
                Page.init('app');
                await Page.run();
                this.postRenderfn(); 
            } catch (error) {
                this.preRenderfn();
                document.querySelector(this.routesDiv).innerHTML="<app></app>";
                fallbackPage.init('app');
                await fallbackPage.run();
                this.postRenderfn();
            }
        };
    }

    redirect(url,newUrl){
        window.nijor.routes[url] = ()=>{
            window.nijor.redirect(newUrl);
        };
        window.nijor.routes[url+'/'] = ()=>{
            window.nijor.redirect(newUrl);
        };
    }

    render = async App =>{
        try {
            App.init('app');
            await App.run(); 
        } catch (error) {}
        let url = window.location.pathname;
        window.nijor.renderRoute(url);
    }
}

const router = new Router('#n-routes');
router.route('/',Index);
router.route('/welcome',Welcome);
router.route('*',Error404);
router.render(App);
