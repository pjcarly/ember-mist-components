// @ts-ignore
import Fragment from "ember-data-model-fragments/fragment";
import Store from "@ember-data/store";
import { attr } from "@ember-data/model";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import { task } from "ember-concurrency-decorators";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { taskFor } from "ember-concurrency-ts";
import AddressService from "../services/address";

export default class Address extends Fragment {
  // @ts-ignore
  @service("address") addressing!: AddressService;
  @service store!: Store;

  /**
   * This is the Address format that will be used to validate the address
   * This checks on the requied fields (depending on the country)
   * The format of postal codes, ...
   */
  @tracked format?: any;

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
    newAddress.countryCode = this.countryCode;
    newAddress.administrativeArea = this.administrativeArea;
    newAddress.locality = this.locality;
    newAddress.dependentLocality = this.dependentLocality;
    newAddress.postalCode = this.postalCode;
    newAddress.sortingCode = this.sortingCode;
    newAddress.addressLine1 = this.addressLine1;
    newAddress.addressLine2 = this.addressLine2;
    return newAddress;
  }

  setAllFromAddress(address: Address) {
    this.countryCode = address.countryCode;
    this.administrativeArea = address.administrativeArea;
    this.locality = address.locality;
    this.dependentLocality = address.dependentLocality;
    this.postalCode = address.postalCode;
    this.sortingCode = address.sortingCode;
    this.addressLine1 = address.addressLine1;
    this.addressLine2 = address.addressLine2;
  }

  clear() {
    this.countryCode = undefined;
    this.administrativeArea = undefined;
    this.locality = undefined;
    this.dependentLocality = undefined;
    this.postalCode = undefined;
    this.sortingCode = undefined;
    this.addressLine1 = undefined;
    this.addressLine2 = undefined;
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
      addressLine2: this.addressLine2,
    };

    return pojo;
  }

  clearExceptAddressLines() {
    this.countryCode = undefined;
    this.administrativeArea = undefined;
    this.locality = undefined;
    this.dependentLocality = undefined;
    this.postalCode = undefined;
    this.sortingCode = undefined;
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
      "familyName",
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

  @task
  async loadFormat(): Promise<void> {
    if (!this.countryCode) {
      if (!this.isBlankModel) {
        // no country code is chosen, the address must be cleared
        this.clear();
        this.format = undefined;
      }
    } else {
      if (!this.format || this.format.data.id !== this.countryCode) {
        const format = await taskFor(this.addressing.getAddressFormat).perform(
          this.countryCode
        );
        this.format = format;
      }
    }
  }
}
