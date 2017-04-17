import Ember from 'ember';
import { replaceAll } from 'ember-field-components/classes/utils';

export default Ember.Object.extend({
  init(){
    this.set('page', 1);
    this.set('limit', 10);
    this.set('dir', 'asc');
  },
  params: Ember.computed('page', 'limit', 'sort', 'dir', 'filter', 'search', 'include', 'standardFilter', function(){
    let standardFilter = this.get('standardFilter');
    let queryParams = this.getProperties('page', 'limit', 'sort', 'dir', 'search', 'include');
    queryParams['filter'] = {};

    if(!Ember.isBlank(standardFilter)){
      queryParams['filter'] = Ember.copy(standardFilter);
    }

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    if(!Ember.isBlank(queryParams.search)){
      let column = this.get('searchField');
      queryParams.filter[column] = {};
      queryParams.filter[column]['operator'] = 'like';
      queryParams.filter[column]['value'] = replaceAll(queryParams.search, '*', '%');
    }
    if(Ember.isBlank(queryParams.page)){
      delete queryParams.page;
    }
    if(Ember.isBlank(queryParams.limit)){
      delete queryParams.limit;
    }
    if(Ember.isBlank(queryParams.include)){
      delete queryParams.include;
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
  searchField: Ember.computed('sort', function(){
    return Ember.isBlank(this.get('sort')) ? 'name' : this.get('sort');
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
