import Validator from 'ember-attribute-validations/validator';
import { isBlank } from '@ember/utils';

export default Validator.extend({
  message: '%@ is required',
  validate(name, value) {
    if(isBlank(value) || value.get('isBlankModel')){
      return this.format();
    }
  }
});
