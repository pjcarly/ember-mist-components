import SingleModelRoute from './single-model-route';
import RecentlyViewedService from 'ember-mist-components/services/recently-viewed';
import EntityCacheService from 'ember-mist-components/services/entity-cache';
import DrupalModel from 'ember-mist-components/models/drupal-model';
import { inject as service } from '@ember-decorators/service';
import { authenticatedRoute } from 'ember-mist-components/decorators/authenticated-route';
import Transition from '@ember/routing/-private/transition';

@authenticatedRoute
export default abstract class ModelViewRoute extends SingleModelRoute {
  @service entityCache !: EntityCacheService;
  @service storage !: any;
  @service recentlyViewed !: RecentlyViewedService;

  afterModel(model: DrupalModel, transition: Transition) {
    super.afterModel(model, transition);

    this.entityCache.clearReturnToModel();
    this.recentlyViewed.addRecentlyViewed(model);
  }
}
