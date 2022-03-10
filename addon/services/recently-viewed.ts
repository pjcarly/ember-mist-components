import Service from "@ember/service";
import Model from "@ember-data/model";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";
import StorageService from '@getflights/ember-mist-components/services/storage';
import { cached } from "@glimmer/tracking";

export interface RecentlyViewedRecord {
  type: string;
  name: string;
  id: string;
}

export default class RecentlyViewedService extends Service {
  @service storage!: StorageService;
  @service fieldInformation!: FieldInformationService;

  /**
   * Remove a record from recently viewed
   * @param type The type of model you want to remove
   * @param id THe ID of the model you want to remove from recently viewed
   */
  removeRecentlyViewed(type: string, id: string): void {
    const oldRecentlyViewedRecords = this.records;

    let newRecentlyViewedRecords: RecentlyViewedRecord[] = [];
    let index = 1;
    for (let oldRecentlyViewedRecord of oldRecentlyViewedRecords) {
      if (
        !(
          oldRecentlyViewedRecord.id === id &&
          oldRecentlyViewedRecord.type === type
        )
      ) {
        newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
        index++;

        if (index >= 10) {
          break;
        }
      }
    }

    this.storage.persist("recentlyViewedRecords", newRecentlyViewedRecords);
  }

  /**
   * Add a model to the recently viewed records
   * @param model The model you want to add
   */
  addRecentlyViewed(model: Model): void {
    if (!isBlank(model)) {
      let newRecentlyViewedRecord = {
        type: this.fieldInformation.getModelName(model),
        // @ts-ignore
        name: model.name,
        // @ts-ignore
        id: model.id,
      };

      const oldRecentlyViewedRecords = this.records;

      let newRecentlyViewedRecords = [];
      newRecentlyViewedRecords.push(newRecentlyViewedRecord);

      let index = 1;
      for (let oldRecentlyViewedRecord of oldRecentlyViewedRecords) {
        if (
          !(
            oldRecentlyViewedRecord.id === newRecentlyViewedRecord.id &&
            oldRecentlyViewedRecord.type === newRecentlyViewedRecord.type
          )
        ) {
          newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
          index++;

          if (index >= 10) {
            break;
          }
        }
      }

      this.storage.persist("recentlyViewedRecords", newRecentlyViewedRecords);
    }
  }

  /**
   * Returns the Recently Viewed records currently in local storage, if nothing is found an empty array is returned
   */
  @cached
  get records(): RecentlyViewedRecord[] {
    let oldRecentlyViewedRecords: RecentlyViewedRecord[] = this.storage.retrieve(
      "recentlyViewedRecords"
    );
    if (isBlank(oldRecentlyViewedRecords)) {
      oldRecentlyViewedRecords = [];
    }

    return oldRecentlyViewedRecords;
  }
}
