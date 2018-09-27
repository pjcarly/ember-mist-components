import { getModelName } from 'ember-field-components/classes/model-utils';
import { isBlank } from '@ember/utils';

export function removeRecentlyViewed(type, id, storage){
  let oldRecentlyViewedRecords = storage.get('recentlyViewedRecords');
  if(isBlank(oldRecentlyViewedRecords)){
    oldRecentlyViewedRecords = [];
  }

  let newRecentlyViewedRecords = [];
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

  storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
}

export function addRecentlyViewed(model, storage){
  if(!isBlank(model)) {
    let newRecentlyViewedRecord = {
      type: getModelName(model),
      name: model.get('name'),
      id: model.get('id')
    };

    let oldRecentlyViewedRecords = storage.get('recentlyViewedRecords');
    if(isBlank(oldRecentlyViewedRecords)){
      oldRecentlyViewedRecords = [];
    }

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

    storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
  }
}
