import Validator from 'ember-attribute-validations/validator';
import { isBlank } from '@ember/utils';

export default Validator.extend({
  validate(name, value, attribute, model) {
    const requiredField = attribute.options.validation.conditionalRequired;

    if(attribute.isAttribute) {
      if(model.get(requiredField) && isBlank(value)){
        return this.format();
      }
    } else if (attribute.isRelationship && attribute.kind === 'belongsTo') {
      if(model.get(requiredField) && isBlank(model.belongsTo(name).id())){
        return this.format();
      }
    }
  }
});
