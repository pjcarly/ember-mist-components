import Ember from 'ember';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Component.extend({
  classNames: ['card recently-viewed'],
  storage: service(),
  recentlyViewedRecords: computed('storage.recentlyViewedRecords', function(){
    const recentlyViewedRecords = this.get('storage.recentlyViewedRecords');
    if(isBlank(recentlyViewedRecords)){
      return [];
    } else {
      return recentlyViewedRecords;
    }
  })
})
