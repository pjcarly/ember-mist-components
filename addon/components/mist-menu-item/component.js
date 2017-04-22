import Ember from 'ember';
const { Component, computed, isBlank } = Ember;

export default Component.extend({
  tagName: 'li',
  linkTo: false,
  hasAction: computed('action', function(){
    return !isBlank(this.get('action'));
  }),
  click() {
    if(this.get('hasAction')){
      return this.sendAction();
    }
  }
});
