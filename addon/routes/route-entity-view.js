import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import { removeRecentlyViewed, addRecentlyViewed } from 'ember-mist-components/classes/recently-viewed';

const { Route } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, SingleEntityRouteMixin, ScrollToTop, {
  entityCache: service(),
  storage: service(),
  model(params){
    return this._super(...arguments).catch((error) => {
      const entityType = this.get('entityName');
      if(!isBlank(entityType)) {
        const idParam = `${entityType}_id`;
        if(!isBlank(idParam) && params.hasOwnProperty(idParam)) {
          const id = params[idParam];
          if(!isBlank(id)) {
            removeRecentlyViewed(entityType, id, this.get('storage'));
          }
        }
      }
    });
  },
  afterModel(model){
    this.get('entityCache').clearReturnToModel();
    addRecentlyViewed(model, this.get('storage'));
  }
});
