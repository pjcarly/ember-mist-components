import Ember from 'ember';
import { replaceAll } from 'ember-field-components/classes/utils';

const { Object } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { copy } = Ember;

export default Object.extend({
  init(){
    this.set('page', 1);
    this.set('limit', 10);
    this.set('dir', 'asc');
  },
  params: computed('page', 'limit', 'sort', 'dir', 'filter', 'search', 'include', 'standardFilter', function(){
    let standardFilter = this.get('standardFilter');
    let queryParams = this.getProperties('page', 'limit', 'sort', 'dir', 'search', 'include');
    queryParams['filter'] = {};

    if(!isBlank(standardFilter)){
      queryParams['filter'] = copy(standardFilter);
    }

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    if(!isBlank(queryParams.search)){
      let column = this.get('searchField');
      queryParams.filter[column] = {};
      queryParams.filter[column]['operator'] = 'like';
      queryParams.filter[column]['value'] = replaceAll(queryParams.search, '*', '%');
    }
    if(isBlank(queryParams.page)){
      delete queryParams.page;
    }
    if(isBlank(queryParams.limit)){
      delete queryParams.limit;
    }
    if(isBlank(queryParams.include)){
      delete queryParams.include;
    }
    if(isBlank(queryParams.sort)){
      delete queryParams.sort;
    }
    if(isBlank(queryParams.filter)){
      delete queryParams.filter;
    }
    delete queryParams.dir;
    delete queryParams.search;

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
