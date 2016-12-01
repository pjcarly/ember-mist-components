import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ResetControllerMixin from 'ember-mist-components/mixins/route-reset-controller';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';

export default Ember.Route.extend(AuthenticatedRouteMixin, ResetControllerMixin, SingleEntityRouteMixin);
