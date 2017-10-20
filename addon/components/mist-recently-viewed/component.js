import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Component.extend({
  classNames: ['card recently-viewed'],
  storage: service(),
  store: service(),
  entityRouter: service(),
  toast: service(),
  recentlyViewedRecords: computed('storage.recentlyViewedRecords', function(){
    const recentlyViewedRecords = this.get('storage.recentlyViewedRecords');
    if(isBlank(recentlyViewedRecords)){
      return [];
    } else {
      return recentlyViewedRecords;
    }
  }),
  navigateTo: task(function * (record){
    yield this.get('store').findRecord(record.type, record.id).then((foundRecord) => {
      this.get('entityRouter').transitionToView(foundRecord);
    }).catch(() => {
      // remove record from recentlyViewed, it is no longer available, deleted possibly?
      this.get('toast').warning('Record not found', 'Record not found');
      const oldRecentlyViewedRecords = this.get('storage.recentlyViewedRecords');
      let newRecentlyViewedRecords = [];

      for(const oldRecentlyViewedRecord of oldRecentlyViewedRecords){
        if(!(oldRecentlyViewedRecord.id === record.id && oldRecentlyViewedRecord.type === record.type)){
          newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
        }
      }

      this.set('storage.recentlyViewedRecords', newRecentlyViewedRecords);
    });
  }),
  actions: {
    recordSelected(record){
      this.get('navigateTo').perform(record);
    }
  }
})
