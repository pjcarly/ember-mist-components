import Validator, {
  ValidatorOptions,
} from "@getflights/ember-attribute-validations/base-validator";
import Model from "@ember-data/model";
import { hasValue } from "@getflights/ember-attribute-validations/utils";
import { inject as service } from "@ember/service";
import PhoneIntlService from "../services/phone-intl";

export default class PhoneValidator extends Validator<ValidatorOptions> {
  @service phoneIntl!: PhoneIntlService;

  name = "validPhone";

  validate(value: string, _model: Model): string | boolean {
    const utils = this.phoneIntl.getUtils();

    if (hasValue(value) && !utils.isValidNumber(value)) {
      return this.format();
    }

    return false;
  }
}
