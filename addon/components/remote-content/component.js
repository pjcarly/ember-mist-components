import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { isBlank } = Ember;
const { debug } = Ember;
const { inject } = Ember;
const { computed } = Ember;
const { service } = inject;
const { String } = Ember;
const { htmlSafe } = String;

export default Component.extend({
  store: service(),
  didInsertElement(){
    this._super(...arguments);
    this.get('fetchContent').perform();
  },
  fetchContent: task(function * (){
    const key = this.get('key');

    if(isBlank(key)){
      return;
    }

    const store = this.get('store');

    if(store.hasRecordForId('api-block', key)) {
      model = store.peekRecord('api-block', key);
      this.set('remoteContent', model.get('body'));
    } else {
      yield store.findRecord('api-block', key).then((model) => {
        this.set('remoteContent', model.get('body'));
      }).catch((error) => {
        debug(`Error fetching remote content: ${key}`);
        console.log(error);
      });
    }
  }),
  content: computed('remoteContent', function(){
    return htmlSafe(this.get('remoteContent'));
  })
});
