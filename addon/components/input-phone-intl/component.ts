import { action } from "@ember/object";
import { OptionsArgument } from "@getflights/ember-field-components/components/BaseInput";
import InputPhoneComponent, {
  PhoneArguments,
} from "@getflights/ember-field-components/components/input-phone/component";
import intlTelInput from "intl-tel-input";
import { inject as service } from "@ember/service";
import PhoneIntlService from "dummy/services/phone-intl";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-concurrency-ts";
import AddressService from "dummy/services/address";

export interface PhoneOptionsArgument extends OptionsArgument {
  initialCountry?: string;
  placeholderNumberType?: Parameters<
    intlTelInput.Plugin["setPlaceholderNumberType"]
  >[0];
  countryChanged?: (
    country: ReturnType<intlTelInput.Plugin["getSelectedCountryData"]>
  ) => void;
}

export interface Arguments extends PhoneArguments {
  options?: PhoneOptionsArgument;
}

export default class InputPhoneIntlComponent extends InputPhoneComponent<
  Arguments
> {
  @service phoneIntl!: PhoneIntlService;
  @service address!: AddressService;

  type = "phone-intl";
  instance?: intlTelInput.Plugin;

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    taskFor(this.initialize).perform();
  }

  get initialCountry(): string {
    if (
      this.args.options?.initialCountry &&
      !this.args.value &&
      this.instance
    ) {
      this.instance.setCountry(this.args.options.initialCountry);
    }

    return this.instance?.getSelectedCountryData().iso2 ?? "";
  }

  @task
  async initialize() {
    await taskFor(this.phoneIntl.loadUtils).perform();
  }

  @action
  countryChanged() {
    if (this.args.options?.countryChanged && this.instance) {
      this.args.options.countryChanged(this.instance.getSelectedCountryData());
    }
  }

  @action
  elementInsertedInDOM(element: HTMLInputElement) {
    const dropdownContainer = document.getElementById(
      "ember-mist-modal-wormhole"
    );

    const preferredCountries = this.address.defaultCountry
      ? [this.address.defaultCountry]
      : [];

    this.instance = intlTelInput(element, {
      initialCountry: this.args.options?.initialCountry,
      separateDialCode: true,
      dropdownContainer: dropdownContainer ?? undefined,
      preferredCountries: preferredCountries,
      placeholderNumberType:
        this.args.options?.placeholderNumberType ?? "FIXED_LINE",
    });

    element.addEventListener("countrychange", this.countryChanged);
  }

  @action
  elementWillBeRemovedFromDOM(element: HTMLInputElement) {
    element.removeEventListener("countryChange", this.countryChanged);
    this.instance = undefined;
  }
}
