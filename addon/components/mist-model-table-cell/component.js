import Ember from 'ember';

export default Ember.Component.extend({
  tagName: null,
  init() {
    this._super(...arguments);

    console.log(this.get('column'));
    console.log(this.get('row'));
  }
});
