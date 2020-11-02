import Service from "@ember/service";
import Model from "@ember-data/model";
import { tracked } from "@glimmer/tracking";

export default class EntityCacheService extends Service {
  @tracked returnToModel?: Model;
  @tracked afterSaveModel?: Model;
  @tracked cachedModel?: Model;

  /**
   * Clears the return to model
   */
  clearReturnToModel() {
    this.returnToModel = undefined;
  }

  /**
   * Clears the after save Model
   */
  clearAfterSaveModel() {
    this.afterSaveModel = undefined;
  }

  /**
   * Clear the cached model
   */
  clearCachedModel() {
    this.cachedModel = undefined;
  }

  /**
   * Returns the model to return to, and clear the returnToModel on this service
   */
  getReturnToModelAndClear(): Model | undefined {
    const returnToModel = this.returnToModel;
    this.clearReturnToModel();

    return returnToModel;
  }

  /**
   * Returns the After Save Model and clear it on the Service
   */
  getAfterSaveModelAndClear(): Model | undefined {
    const afterSaveModel = this.afterSaveModel;
    this.clearAfterSaveModel();

    return afterSaveModel;
  }
}
