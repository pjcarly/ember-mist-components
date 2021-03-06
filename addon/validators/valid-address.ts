import Validator, {
  ValidatorOptions,
} from "@getflights/ember-attribute-validations/base-validator";
import Model from "@ember-data/model";
import { isBlank } from "@ember/utils";
import Address from "@getflights/ember-mist-components/models/address";
import { assert } from "@ember/debug";

export default class ValidAddressValidator extends Validator<ValidatorOptions> {
  name = "validAddress";

  validate(value: Address, _model: Model): string | boolean {
    assert(
      "The value to validate must be an address, other types not allowed",
      value instanceof Address || isBlank(value)
    );

    if (!isBlank(value) && !value.isBlankModel && !value.isValidModel) {
      return this.format();
    }

    return false;
  }
}
