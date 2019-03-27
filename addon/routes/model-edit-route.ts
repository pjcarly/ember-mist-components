import SingleModelRoute from './single-model-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';

export default abstract class ModelEditRoute extends SingleModelRoute.extend(AuthenticatedRouteMixin, ScrollToTop) {

}
