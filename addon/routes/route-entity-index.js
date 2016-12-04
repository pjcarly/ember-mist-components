import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  entityCache: Ember.inject.service(),
  afterModel(){
    this.get('entityCache').clearReturnToModel();
  }
});
