import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";

export default class StoreHasRecordHelper extends Helper {
  @service store!: Store;

  compute([modelName, id]: [string, string | number | null]): boolean {
    if (!id) {
      return false;
    }

    return this.store.hasRecordForId(modelName, id);
  }
}
