import EmberObject from '@ember/object';
import QueryCondition from 'ember-mist-components/classes/query-condition';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default EmberObject.extend({
  init(){
    this.set('page', 1);
    this.set('limit', 10);
    this.set('dir', 'asc');
    this.set('conditions', []);
    this.set('baseConditions', []);
  },
  addCondition(condition){
    const conditions = this.get('conditions');
    conditions.push(condition);
    this.set('conditions', conditions);
  },
  clearConditions(){
    this.set('conditions', []);
  },
  params: computed('page', 'limit', 'sort', 'dir', 'filter', 'search', 'include', 'baseConditions', function(){
    let queryParams = {};

    // The page of the results we want to fetch
    if(!isBlank(this.get('page'))){
      queryParams.page = this.get('page');
    }

    // The limit of amount of results we want to receive
    if(!isBlank(this.get('limit'))){
      queryParams.limit = this.get('limit');
    }

    // Any related entities we want to receive
    if(!isBlank(this.get('include'))){
      queryParams.include = this.get('include');
    }

    // The sort order of the results
    if(!isBlank(this.get('sort'))){
      if(this.get('dir') === 'desc'){
        queryParams.sort = '-' + this.get('sort');
      } else {
        queryParams.sort = this.get('sort');
      }
    }

    // Now we set all the meta information, lets see if we need to apply filters
    const filterParam = {};
    let conditionIndex = 1; // we keep an index over all filters, as each filter will be passed in the query string with as key the index

    // First we apply base conditions (these are conditions passed in through the component params)
    if(!isBlank(this.get('baseConditions'))){
      this.get('baseConditions').forEach((baseCondition) => {
        filterParam[conditionIndex++] = baseCondition.get('object');
      });
    }

    // Next we add possible conditions added to the query params object
    if(!isBlank(this.get('conditions'))){
      this.get('conditions').forEach((condition) => {
        const conditionObject = condition.get('object');
        if(!isBlank(conditionObject)){
          queryParams.filter[conditionIndex++] = conditionObject;
        }
      });
    }

    // We must also check if a search query was passed, and add a condition for it as well
    if(!isBlank(this.get('search'))){
      const searchCondition = QueryCondition.create();
      searchCondition.set('field', this.get('searchField'));
      searchCondition.set('operator', 'like');
      searchCondition.set('value', this.get('search'));

      filterParam[conditionIndex++] = searchCondition.get('object');
    }

    // And finally, if there were conditions, we add them to the query params
    if(conditionIndex > 1){
      queryParams.filter = filterParam;
    }

    return queryParams;
  }),
  searchField: computed('sort', function(){
    return isBlank(this.get('sort')) ? 'name' : this.get('sort');
  }),
  nextPage(){
    this.incrementProperty('page');
  },
  prevPage(){
    if(this.get('page') > 1) {
      this.decrementProperty('page');
    }
  }
});
