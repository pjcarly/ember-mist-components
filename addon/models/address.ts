// @ts-ignore
import Fragment from "ember-data-model-fragments/fragment";
import Store from "ember-data/store";
import attr from "ember-data/attr";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import { inject as service } from "@ember/service";

export default class Address extends Fragment {
  @service store!: Store;

  /**
   * This is the Address format that will be used to validate the address
   * This checks on the requied fields (depending on the country)
   * The format of postal codes, ...
   */
  format!: any;

  @attr("string")
  countryCode?: string;

  @attr("string")
  administrativeArea?: string;

  @attr("string")
  locality?: string;

  @attr("string")
  dependentLocality?: string;

  @attr("string")
  postalCode?: string;

  @attr("string")
  sortingCode?: string;

  @attr("string")
  addressLine1?: string;

  @attr("string")
  addressLine2?: string;

  copyAddress(): Address {
    // @ts-ignore
    const newAddress = <Address>this.store.createFragment("address");
    // @ts-ignore
    newAddress.set("countryCode", this.countryCode);
    // @ts-ignore
    newAddress.set("administrativeArea", this.administrativeArea);
    // @ts-ignore
    newAddress.set("locality", this.locality);
    // @ts-ignore
    newAddress.set("dependentLocality", this.dependentLocality);
    // @ts-ignore
    newAddress.set("postalCode", this.postalCode);
    // @ts-ignore
    newAddress.set("sortingCode", this.sortingCode);
    // @ts-ignore
    newAddress.set("addressLine1", this.addressLine1);
    // @ts-ignore
    newAddress.set("addressLine2", this.addressLine2);
    return newAddress;
  }

  clear() {
    // @ts-ignore
    this.set("countryCode", null);
    // @ts-ignore
    this.set("administrativeArea", null);
    // @ts-ignore
    this.set("locality", null);
    // @ts-ignore
    this.set("dependentLocality", null);
    // @ts-ignore
    this.set("postalCode", null);
    // @ts-ignore
    this.set("sortingCode", null);
    // @ts-ignore
    this.set("addressLine1", null);
    // @ts-ignore
    this.set("addressLine2", null);
  }

  /**
   * Returns a plain old javascript object with the attributes filled in as keys, and the values as values
   */
  getPOJO() {
    const pojo = {
      countryCode: this.countryCode,
      administrativeArea: this.administrativeArea,
      locality: this.locality,
      dependentLocality: this.dependentLocality,
      postalCode: this.postalCode,
      sortingCode: this.sortingCode,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2
    };

    return pojo;
  }

  clearExceptAddressLines() {
    // @ts-ignore
    this.set("countryCode", null);
    // @ts-ignore
    this.set("administrativeArea", null);
    // @ts-ignore
    this.set("locality", null);
    // @ts-ignore
    this.set("dependentLocality", null);
    // @ts-ignore
    this.set("postalCode", null);
    // @ts-ignore
    this.set("sortingCode", null);
  }

  @computed(
    "countryCode",
    "administrativeArea",
    "locality",
    "dependentLocality",
    "postalCode",
    "sortingCode",
    "addressLine1",
    "addressLine2"
  )
  get isBlankModel(): boolean {
    return (
      isBlank(this.countryCode) &&
      isBlank(this.administrativeArea) &&
      isBlank(this.locality) &&
      isBlank(this.dependentLocality) &&
      isBlank(this.postalCode) &&
      isBlank(this.sortingCode) &&
      isBlank(this.addressLine1) &&
      isBlank(this.addressLine2)
    );
  }

  @computed(
    "format",
    "countryCode",
    "administrativeArea",
    "locality",
    "dependentLocality",
    "postalCode",
    "sortingCode",
    "addressLine1",
    "addressLine2"
  )
  get isValidModel(): boolean {
    const ignoreFields = [
      "organization",
      "givenName",
      "additionalName",
      "familyName"
    ];
    let returnValue = true;

    if (!isBlank(this.format)) {
      const requiredFields = this.format.data.attributes["required-fields"];
      // @ts-ignore
      requiredFields.some((requiredField: string) => {
        if (!ignoreFields.includes(requiredField)) {
          // @ts-ignore
          if (isBlank(this.get(requiredField))) {
            returnValue = false;
            return !returnValue;
          }
        }
      });
    }

    return returnValue;
  }
}
