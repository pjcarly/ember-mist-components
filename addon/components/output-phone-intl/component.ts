import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";
import { inject as service } from "@ember/service";
import PhoneIntlService from "@getflights/ember-mist-components/services/phone-intl";

export default class OutputPhoneintlComponent extends BaseOutput<Arguments> {
  @service phoneIntl!: PhoneIntlService;

  type = "phone-intl";
  showButton = true;

  get formattedNumber(): string | undefined {
    return this.phoneIntl.formatNumber(this.args.value);
  }
}
