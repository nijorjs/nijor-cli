import { i as img } from './app.js';

var index = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="QYzVtBSbRni7HapKJ5V">
        <img src="${img}" n-scope="QYzVtBSbRni7HapKJ5V">
        <p n-scope="QYzVtBSbRni7HapKJ5V">
            <span style="font-size: 35px; font-weight: bold;" n-scope="QYzVtBSbRni7HapKJ5V">Nijor</span>
            <span class="tagline" n-scope="QYzVtBSbRni7HapKJ5V"> : A modern and practical web framework !</span>
        </p>
        <a n-scope="QYzVtBSbRni7HapKJ5V" onclick="return window.nijor.redirect(this.href)" href="/welcome"><button n-scope="QYzVtBSbRni7HapKJ5V">Get Started</button></a>
    </div>
`);
              },async function(){
                
                
                
                
            });

export { index as default };
