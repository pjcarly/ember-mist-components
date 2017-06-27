import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ResetControllerMixin from 'ember-field-components/mixins/route-reset-controller';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';

const { Route, inject, isBlank } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, ResetControllerMixin, ScrollToTop, {
  store: service(),
  entityCache: service(),

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
