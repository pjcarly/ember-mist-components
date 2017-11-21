import Ember from 'ember';
import DynamicObserverComponent from 'ember-field-components/mixins/component-dynamic-observer';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;


export default Component.extend(DynamicObserverComponent, {
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
