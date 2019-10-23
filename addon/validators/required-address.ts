import Validator from "ember-attribute-validations/validator";
import Model from "ember-data/model";
import { isBlank } from "@ember/utils";
import { hasValue } from "ember-attribute-validations/utils";
import Address from "ember-mist-components/models/address";
import { assert } from "@ember/debug";

export default class RequiredAddressValidator extends Validator {
  name = "requiredAddress";

  validate(_: string, value: Address, _2: any, _3: Model): string | boolean {
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