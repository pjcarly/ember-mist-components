import DynamicObserverComponent from 'ember-field-components/mixins/component-dynamic-observer';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

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
