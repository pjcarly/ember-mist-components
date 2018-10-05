import Component from '@ember/component';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import { getParentModelTypeNames, getParentModelTypeName, getModelName } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default Component.extend(FieldOutputComponent, {
  relationshipModelType: computed('model', 'field', function(){
    if(this.get('isPolymorphic')){
      return getParentModelTypeNames(this.get('model'), this.get('field'));
    } else {
      return getParentModelTypeName(this.get('model'), this.get('field'));
    }
  }),
  isPolymorphic: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');
    return !isBlank(options) && options.hasOwnProperty('polymorphic') && options.polymorphic;
  }),
  fieldId: computed('model', 'field', function(){
    const relationship = this.get('model').get(this.get('field'));

    if(isBlank(relationship)){
      return null;
    } else {
      return relationship.get('id');
    }
  }),
  route: computed('value', function(){
    const value = this.get('value');
    if(!isBlank(value)){
      return `${getModelName(value)}.view`;
    }
  })
});
