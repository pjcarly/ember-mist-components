import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import { addRecentlyViewed } from 'ember-mist-components/classes/recently-viewed';

const { Route } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, SingleEntityRouteMixin, ScrollToTop, {
  entityCache: service(),
  storage: service(),
  afterModel(model){
    this.get('entityCache').clearReturnToModel();
    addRecentlyViewed(model, this.get('storage'));
  }
});
