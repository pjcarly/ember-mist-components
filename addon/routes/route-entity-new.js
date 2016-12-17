import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ResetControllerMixin from 'ember-field-components/mixins/route-reset-controller';

export default Ember.Route.extend(AuthenticatedRouteMixin, ResetControllerMixin, {
  store: Ember.inject.service(),
  entityCache: Ember.inject.service(),

  model() {
    let cache = this.get('entityCache');
    let cachedModel = cache.get('cachedModel');

    if(Ember.isBlank(cachedModel)){
      return this.get('store').createRecord(this.get('entityName'));
    } else {
      cache.clearCachedModel();
      return cachedModel;
    }
  }
});
