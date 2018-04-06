import Ember from 'ember';
import Validator from 'ember-attribute-validations/validator';
const { isBlank } = Ember;

export default Validator.extend({
  message: '%@ is required',
  validate(name, value, attribute, model) {
    const requiredField = attribute.options.validation.conditionalRequired;

    if(model.get(requiredField) && isBlank(value)){
      return this.format();
    }
  }
});
