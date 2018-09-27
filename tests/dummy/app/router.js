import config from './config/environment';
import EmberRouter from '@ember/routing/router';

const Router = EmberRouter.extend({
  location: config.locationType
});

Router.map(function() {
});

export default Router;
