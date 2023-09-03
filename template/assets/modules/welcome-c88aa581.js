import { i as img } from './app.js';

var welcome = new window.nijor.component(async function(){
                  
                  return(`<div class="main" n-scope="jvDk8pDUHLMg">
        <img src="${img}" n-scope="jvDk8pDUHLMg">
        <span class="welcome-msg" n-scope="jvDk8pDUHLMg"> Welcome to the world of Nijor !</span>
        <p n-scope="jvDk8pDUHLMg">Edit the src/ folder to reflect changes in this website !</p>
    </div>
`);
              },async function(){
                
                
                
                
            });

export { welcome as default };
