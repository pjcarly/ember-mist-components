import Ember from 'ember';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { getModelName } from 'ember-field-components/classes/model-utils';

const { Component } = Ember;
const { computed } = Ember;

export default Component.extend(FieldInputComponent, {
  modelName: computed('model', function(){
    return getModelName(this.get('model'));
  })
});
