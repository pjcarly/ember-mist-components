import SingleModelRoute from './single-model-route';
import RecentlyViewedService from '@getflights/ember-mist-components/services/recently-viewed';
import EntityCacheService from '@getflights/ember-mist-components/services/entity-cache';
import Model from '@ember-data/model';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/-private/transition';
import StorageService from '@getflights/ember-mist-components/services/storage';

export default abstract class ModelViewRoute extends SingleModelRoute {
  @service entityCache!: EntityCacheService;
  @service storage!: StorageService;
  @service recentlyViewed!: RecentlyViewedService;

  async afterModel(model: Model, transition: Transition) {
    await super.afterModel(model, transition);

    this.entityCache.clearReturnToModel();
    this.recentlyViewed.addRecentlyViewed(model);
  }
}
