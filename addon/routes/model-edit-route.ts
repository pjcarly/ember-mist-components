import SingleModelRoute from './single-model-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default abstract class ModelEditRoute extends SingleModelRoute.extend(AuthenticatedRouteMixin) {

}
