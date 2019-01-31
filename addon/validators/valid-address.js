import Validator from 'ember-attribute-validations/validator';
import { isBlank } from '@ember/utils';

export default Validator.extend({
  validate(name, value) {
    if(!isBlank(value) && !value.get('isBlankModel') && !value.get('isValidModel')){
      return this.format();
    }
  }
});
