import Ember from 'ember';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;

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
