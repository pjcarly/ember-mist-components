import Ember from 'ember';

export default Ember.Object.extend({
  page: 1,
  limit: 10,
  dir: 'asc',
  sort: null,
  filter: null,
  params: Ember.computed('page', 'limit', 'sort', 'dir', 'filter', function(){
    let queryParams = this.getProperties(['page', 'limit', 'sort', 'dir', 'filter']);

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
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
