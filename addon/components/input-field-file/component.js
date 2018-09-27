import Component from '@ember/component';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { getModelName } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';

export default Component.extend(FieldInputComponent, {
  modelName: computed('model', function(){
    return getModelName(this.get('model'));
  })
});
