import ResetModelRoute from "./reset-model-route";
import Store from "ember-data/store";
import EntityCacheService from "@getflights/ember-mist-components/services/entity-cache";
import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";
import Transition from "@ember/routing/-private/transition";
import SessionService from "ember-simple-auth/services/session";

export default abstract class ModelNewRoute extends ResetModelRoute {
  @service store!: Store;
  @service entityCache!: EntityCacheService;
  @service session!: SessionService;

  modelName!: string;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, "login");
    this._super(...arguments);
  }

  model(): any {
    const cachedModel = this.entityCache.cachedModel;

    if (isBlank(cachedModel)) {
      return this.store.createRecord(this.modelName);
    } else {
      this.entityCache.clearCachedModel();
      return cachedModel;
    }
  }
}
