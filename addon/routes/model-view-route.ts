import SingleModelRoute from './single-model-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import RecentlyViewedService from 'ember-mist-components/services/recently-viewed';
import EntityCacheService from 'ember-mist-components/services/entity-cache';
import DrupalModel from 'ember-mist-components/models/drupal-model';
import { inject as service } from '@ember-decorators/service';

export default abstract class ModelViewRoute extends SingleModelRoute.extend(AuthenticatedRouteMixin, ScrollToTop) {
  @service entityCache !: EntityCacheService;
  @service storage !: any;
  @service recentlyViewed !: RecentlyViewedService;

  afterModel(model: DrupalModel) {
    super.afterModel(model);

    this.entityCache.clearReturnToModel();
    this.recentlyViewed.addRecentlyViewed(model);
  }
}
