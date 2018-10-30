import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { computed } from '@ember/object';
import { debug, assert } from '@ember/debug';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  ajax: service(),
  store: service(),

  searchTask: task(function* (query) {
    const { modelType, store, queryParams } = this.getProperties('modelType', 'store', 'queryParams');
    assert('Must pass a modelType as attribute', !isBlank(modelType));

    yield timeout(500); // Lets debounce the typing by 500ms

    queryParams.filter[1]['value'] = query;

    return store.query(modelType, queryParams)
    .then((results) => {
      return results;
    }).catch((error) => {
      debug(error);
    })
  }),
  queryParams: computed('filters', function(){
    const returnValue = {};
    const lookupFilters = this.get('filters');

    returnValue.filter = {};
    returnValue.filter['1'] = {
      field: 'name',
      operator: 'STARTS_WITH'
    }

    lookupFilters.forEach((lookupFilter, index) => {
      returnValue.filter[index+2] = lookupFilter.get('object')
    });

    return returnValue;
  }),
  actions: {
    valueChanged(value){
      const action = this.get('valueChanged');
      if(!isBlank(action)){
        action(value);
      }
    }
  }
});
