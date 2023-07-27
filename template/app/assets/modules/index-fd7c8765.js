import { i as img } from './app.js';

var index = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="BR2rJBcrThQ1D3d7ZsqJ">
        <img src="${img}" n-scope="BR2rJBcrThQ1D3d7ZsqJ">
        <p n-scope="BR2rJBcrThQ1D3d7ZsqJ">
            <span style="font-size: 35px; font-weight: bold;" n-scope="BR2rJBcrThQ1D3d7ZsqJ">Nijor</span>
            <span class="tagline" n-scope="BR2rJBcrThQ1D3d7ZsqJ"> : A modern and practical web framework !</span>
        </p>
        <a n-scope="BR2rJBcrThQ1D3d7ZsqJ" onclick="return window.nijor.redirect(this.href)" href="/welcome"><button n-scope="BR2rJBcrThQ1D3d7ZsqJ">Get Started</button></a>
    </div>
`);
              },async function(){
                
                
                
                
            });

export { index as default };
