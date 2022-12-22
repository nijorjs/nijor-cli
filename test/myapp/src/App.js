import "nijor";
import App from 'App.nijor';
import Index from 'pages/index.nijor';
import Welcome from 'pages/welcome.nijor';
import Error404 from 'pages/404.nijor';
import Router from 'nijor/router';
const router = new Router('#n-routes');
router.route('/',Index);
router.route('/welcome',Welcome);
router.route('*',Error404);
router.render(App);