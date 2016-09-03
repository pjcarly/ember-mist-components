import Ember from 'ember';
import StringUtils from 'ember-field-components/classes/string-utils';

export default Ember.Object.extend({
  page: 1,
  limit: 10,
  dir: 'asc',
  sort: null,
  filter: null,
  search: '',
  params: Ember.computed('page', 'limit', 'sort', 'dir', 'filter', 'search', function(){
    let queryParams = this.getProperties(['page', 'limit', 'sort', 'dir', 'filter', 'search']);

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    if(!Ember.isBlank(queryParams.search)){
      let column = Ember.isBlank(queryParams.sort) ? 'name' : queryParams.sort;
      queryParams.filter = Ember.isBlank(queryParams.filter) ? {} : queryParams.filter;
      queryParams.filter[column] = {};
      queryParams.filter[column]['operator'] = 'like';
      queryParams.filter[column]['value'] = StringUtils.replaceAll(queryParams.search, '*', '%');
    }
    if(Ember.isBlank(queryParams.page)){
      delete queryParams.page;
    }
    if(Ember.isBlank(queryParams.limit)){
      delete queryParams.limit;
    }
    if(Ember.isBlank(queryParams.sort)){
      delete queryParams.sort;
    }
    if(Ember.isBlank(queryParams.filter)){
      delete queryParams.filter;
    }
    delete queryParams.dir;
    delete queryParams.search;

    return queryParams;
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
