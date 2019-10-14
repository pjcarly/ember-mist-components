import Service from "@ember/service";
import Model from "ember-data/model";

export default class EntityCacheService extends Service {
  returnToModel: Model | null = null;
  cachedModel: Model | null = null;

  /**
   * Clears the return to model
   */
  clearReturnToModel() {
    this.set("returnToModel", null);
  }

  /**
   * Clear the cached model
   */
  clearCachedModel() {
    this.set("cachedModel", null);
  }

  /**
   * Returns the model to return to, and clear the returnToModel on this service
   */
  getReturnToModelAndClear(): Model | null {
    const returnToModel = this.returnToModel;
    this.clearReturnToModel();

    return returnToModel;
  }
}
