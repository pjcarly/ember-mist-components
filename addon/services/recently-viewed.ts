import Service from "@ember/service";
import DrupalModel from "ember-mist-components/models/drupal-model";
import FieldInformationService from "ember-field-components/services/field-information";
import { inject as service } from '@ember-decorators/service';
import { isBlank } from '@ember/utils';
import { computed } from "@ember-decorators/object";

export interface RecentlyViewedRecord {
  type : string;
  name : string;
  id : string;
}

export default class RecentlyViewedService extends Service {
  @service storage !: any;
  @service fieldInformation !: FieldInformationService;

  /**
   * Remove a record from recently viewed
   * @param type The type of model you want to remove
   * @param id THe ID of the model you want to remove from recently viewed
   */
  removeRecentlyViewed(type : string, id : string) : void {
    const oldRecentlyViewedRecords = this.records;

    let newRecentlyViewedRecords : RecentlyViewedRecord[] = [];
    let index = 1;
    for(let oldRecentlyViewedRecord of oldRecentlyViewedRecords){
      if(!(oldRecentlyViewedRecord.id === id && oldRecentlyViewedRecord.type === type)){
        newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
        index++;

        if(index >= 10) {
          break;
        }
      }
    }

    this.storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
  }

  /**
   * Add a model to the recently viewed records
   * @param model The model you want to add
   */
  addRecentlyViewed(model: DrupalModel) : void {
    if(!isBlank(model)) {
      let newRecentlyViewedRecord = {
        type: this.fieldInformation.getModelName(model),
        name: model.name,
        id: model.id
      };

      const oldRecentlyViewedRecords = this.records;

      let newRecentlyViewedRecords = [];
      newRecentlyViewedRecords.push(newRecentlyViewedRecord);

      let index = 1;
      for(let oldRecentlyViewedRecord of oldRecentlyViewedRecords){
        if(!(oldRecentlyViewedRecord.id === newRecentlyViewedRecord.id && oldRecentlyViewedRecord.type === newRecentlyViewedRecord.type)){
          newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
          index++;

          if(index >= 10) {
            break;
          }
        }
      }

      this.storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
    }
  }

  /**
   * Returns the Recently Viewed records currently in local storage, if nothing is found an empty array is returned
   */
  @computed('storage.recentlyViewedRecords.[]')
  get records() : RecentlyViewedRecord[] {
    let oldRecentlyViewedRecords : RecentlyViewedRecord[] = this.storage.get('recentlyViewedRecords');
    if(isBlank(oldRecentlyViewedRecords)){
      oldRecentlyViewedRecords = [];
    }

    return oldRecentlyViewedRecords;
  }
}
