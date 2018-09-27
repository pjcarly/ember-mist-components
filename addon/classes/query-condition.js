import EmberObject from '@ember/object';
import { replaceAll } from 'ember-field-components/classes/utils';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default EmberObject.extend({
  init(){
    this.set('field', null);
    this.set('operator', '=');
    this.set('value', null);
  },
  object: computed('field', 'operator', 'value', 'id', function(){
    const { field, operator, value, id } = this.getProperties('field', 'operator', 'value', 'id');
    let returnValue = {};

    if(isBlank(field)){
      return null;
    }

    returnValue = {};
    returnValue['field'] = field;

    // ID is something special, it is only used for relationship fields, when you pass an ID, it is used over value
    // All other field types should use value instead
    if(isBlank(id)){
      // ID is blank, we can just use the value logic
      if(isBlank(operator) || operator === '='){
        // equals is the default operator, and doesnt need to be explicitly passed
        returnValue['value'] = value;
      } else {
        // A different operator was provided, lets pass it in the filter
        returnValue['operator'] = operator;

        if(operator === 'like'){
          // When the operator is "like", we change the wildard from * to %
          returnValue['value'] = replaceAll(value, '*', '%');
        } else {
          returnValue['value'] = value;
        }
      }
    } else {
      // an ID was passed, we use it over value
      if(isBlank(operator) || operator === '='){
        // equals is the default operator, and doesnt need to be explicitly passed
        returnValue['id'] = id;
      } else {
        // A different operator was provided, lets pass it in the filter
        returnValue['operator'] = operator;

        if(operator === 'like'){
          // When the operator is "like", we change the wildard from * to %
          returnValue['id'] = replaceAll(id, '*', '%');
        } else {
          returnValue['id'] = id;
        }
      }
    }

    return returnValue;
  })
});
