import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, inject } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  entityCache: inject.service(),
  afterModel(){
    this.get('entityCache').clearReturnToModel();
  }
});
