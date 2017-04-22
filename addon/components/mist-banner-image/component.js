import Ember from 'ember';
const { Component, computed, isBlank } = Ember;

export default Component.extend({
  tagName: null,
  value: computed('model', 'field', function(){
    let model = this.get('model');
    let field = this.get('field');

    if(!isBlank(model) && !isBlank(field)){
      let value = this.get('model').get(this.get('field'));
      if(!isBlank(value)){
        return value;
      }
    }
  })
});
