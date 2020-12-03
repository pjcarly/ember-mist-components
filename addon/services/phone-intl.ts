import { getOwner } from "@ember/application";
import { assert } from "@ember/debug";
import { computed } from "@ember/object";
import Service from "@ember/service";
import { dropTask } from "ember-concurrency-decorators";
import intlTelInput from "intl-tel-input";

export interface intlTelInputUtils {
  isValidNumber(number: string, countryCode?: string): boolean;
  formatNumber(
    number: string,
    countryCode?: string,
    format?: intlTelInputUtils.numberFormat
  ): string | undefined;
}

export default class PhoneIntlService extends Service {
  private utilsLoaded = false;

  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @dropTask
  async loadUtils(): Promise<void> {
    const src = this.config?.["ember-mist-components"]?.phoneIntlUtilsSource;
    assert("ember-mist-components.phoneIntlUtilsSource is not defined", src);

    if (!window.intlTelInputGlobals) {
      // The global is only set, when any component was initialized
      // In case that had not happened yet, lets create an element, initialize it, and remove it
      const element = document.createElement("input");
      intlTelInput(element);
      element.remove();
    }

    if (!this.utilsLoaded) {
      await window.intlTelInputGlobals.loadUtils(src);
    }
  }

  getUtils(): intlTelInputUtils {
    return <intlTelInputUtils>(<unknown>window.intlTelInputUtils);
  }

  /**
   * Validate an international phone number
   * @param number Number in international format
   */
  isValidNumber(number: string): boolean {
    return this.getUtils().isValidNumber(number);
  }

  /**
   * Format an international number according to local formatting rules
   * @param number Number in international format
   */
  formatNumber(number?: string): string | undefined {
    if (number) {
      return this.getUtils().formatNumber(
        number,
        undefined,
        intlTelInputUtils.numberFormat.INTERNATIONAL
      );
    }

    return;
  }
}