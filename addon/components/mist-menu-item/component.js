import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  linkTo: false,
  hasAction: Ember.computed('action', function(){
    return !Ember.isBlank(this.get('action'));
  }),
  click() {
    if(this.get('hasAction')){
      return this.sendAction();
    }
  }
});
