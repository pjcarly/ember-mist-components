import { action } from "@ember/object";
import { OptionsArgument } from "@getflights/ember-field-components/components/BaseInput";
import InputPhoneComponent, {
  PhoneArguments,
} from "@getflights/ember-field-components/components/input-phone/component";
import intlTelInput from "intl-tel-input";

export interface PhoneOptionsArgument extends OptionsArgument {
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
  type = "phone-intl";

  instance?: intlTelInput.Plugin;

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

    this.instance = intlTelInput(element, {
      separateDialCode: true,
      dropdownContainer: dropdownContainer ?? undefined,
    });

    element.addEventListener("countrychange", this.countryChanged);
  }

  @action
  elementWillBeRemovedFromDOM(element: HTMLInputElement) {
    element.removeEventListener("countryChange", this.countryChanged);
    this.instance = undefined;
  }
}
