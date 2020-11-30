import Validator, {
  ValidatorOptions,
} from "@getflights/ember-attribute-validations/base-validator";
import Model from "@ember-data/model";
import { isBlank } from "@ember/utils";
import { hasValue } from "@getflights/ember-attribute-validations/utils";
import Address from "@getflights/ember-mist-components/models/address";
import { assert } from "@ember/debug";

export default class RequiredAddressValidator extends Validator<ValidatorOptions> {
  name = "requiredAddress";

  validate(value: Address, _model: Model): string | boolean {
    assert(
      "The value to validate must be an address, other types not allowed",
      value instanceof Address || isBlank(value)
    );

    if (!hasValue(value) || value.isBlankModel) {
      return this.format();
    }

    return false;
  }
}
