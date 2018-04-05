import Ember from 'ember';
import Validator from 'ember-attribute-validations/validator';
const { isBlank } = Ember;

export default Validator.extend({
  message: '%@ is an invalid address for the selected country, fill in the required fields',
  validate(name, value) {
    if(!isBlank(value) && !value.get('isBlankModel') && !value.get('isValidModel')){
      return this.format();
    }
  }
});
