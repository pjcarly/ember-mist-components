import ResetModelRoute from './reset-model-route';
import Store from '@ember-data/store';
import EntityCacheService from '@getflights/ember-mist-components/services/entity-cache';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/-private/transition';
import SessionService from 'ember-simple-auth/services/session';
import Model from '@ember-data/model';

export default abstract class ModelNewRoute extends ResetModelRoute {
  @service store!: Store;
  @service entityCache!: EntityCacheService;
  @service session!: SessionService;

  abstract modelName: string;

  async beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
    return super.beforeModel(transition);
  }

  async model(): Promise<Model> {
    const cachedModel = this.entityCache.cachedModel;

    if (!cachedModel) {
      return <Model>this.store.createRecord(this.modelName);
    } else {
      this.entityCache.clearCachedModel();
      return cachedModel;
    }
  }
}
