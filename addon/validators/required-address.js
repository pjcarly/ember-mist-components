import Ember from 'ember';
import Validator from 'ember-attribute-validations/validator';
const { isBlank } = Ember;

export default Validator.extend({
  message: '%@ is required',
  validate(name, value) {
    if(isBlank(value) || value.get('isBlankModel')){
      return this.format();
    }
  }
});
