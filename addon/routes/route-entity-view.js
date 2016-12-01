import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';

export default Ember.Route.extend(AuthenticatedRouteMixin, SingleEntityRouteMixin, {
  entityName: 'contact'
});
