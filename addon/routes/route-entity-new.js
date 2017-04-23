import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ResetControllerMixin from 'ember-field-components/mixins/route-reset-controller';

const { Route, inject, isBlank } = Ember;

export default Route.extend(AuthenticatedRouteMixin, ResetControllerMixin, {
  store: inject.service(),
  entityCache: inject.service(),

  model() {
    let cache = this.get('entityCache');
    let cachedModel = cache.get('cachedModel');

    if(isBlank(cachedModel)){
      return this.get('store').createRecord(this.get('entityName'));
    } else {
      cache.clearCachedModel();
      return cachedModel;
    }
  }
});
