import ResetModelRoute from "./reset-model-route";
import Store from "ember-data/store";
import EntityCacheService from "ember-mist-components/services/entity-cache";
// @ts-ignore
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";

export default abstract class ModelNewRoute extends ResetModelRoute.extend(
  AuthenticatedRouteMixin
) {
  @service store!: Store;
  @service entityCache!: EntityCacheService;

  modelName!: string;

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
