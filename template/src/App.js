import "nijor";
import "nijor/router";
import App from 'App.nijor';

//@Routes()

App.init('app');
App.run();
window.nijor.renderRoute(window.location.pathname);