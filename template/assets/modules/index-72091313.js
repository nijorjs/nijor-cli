import { i as img } from './app.js';

var index = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="4yf43zgoM">
        <img src="${img}" n-scope="4yf43zgoM">
        <p n-scope="4yf43zgoM">
            <span style="font-size: 35px; font-weight: bold;" n-scope="4yf43zgoM">Nijor</span>
            <span class="tagline" n-scope="4yf43zgoM"> : A modern and practical web framework !</span>
        </p>
        <a n-scope="4yf43zgoM" onclick="return window.nijor.redirect(this.href)" href="/welcome"><button n-scope="4yf43zgoM">Get Started</button></a>
    </div>
`);
              },async function(){
                
                
                
                
            });

export { index as default };
