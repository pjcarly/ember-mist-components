import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import { isBlank } from '@ember/utils';
import Store from 'ember-data/store';
import { inject as service } from '@ember-decorators/service';

export default class Address extends Fragment {
  @service store !: Store;

  /**
   * This is the Address format that will be used to validate the address
   * This checks on the requied fields (depending on the country)
   * The format of postal codes, ...
   */
  format !: any;

  @attr('string')
  countryCode?: string;

  @attr('string')
  administrativeArea ?: string;

  @attr('string')
  locality?: string;

  @attr('string')
  dependentLocality ?: string;

  @attr('string')
  postalCode?: string;

  @attr('string')
  sortingCode?: string;

  @attr('string')
  addressLine1?: string;

  @attr('string')
  addressLine2?: string;

  copyAddress() : Address {
    const newAddress = <Address> this.store.createFragment('address');
    newAddress.set('countryCode', this.countryCode);
    newAddress.set('administrativeArea', this.administrativeArea);
    newAddress.set('locality', this.locality);
    newAddress.set('dependentLocality', this.dependentLocality);
    newAddress.set('postalCode', this.postalCode);
    newAddress.set('sortingCode', this.sortingCode);
    newAddress.set('addressLine1', this.addressLine1);
    newAddress.set('addressLine2', this.addressLine2);
    return newAddress;
  }

  clear(){
    this.set('countryCode', null);
    this.set('administrativeArea', null);
    this.set('locality', null);
    this.set('dependentLocality', null);
    this.set('postalCode', null);
    this.set('sortingCode', null);
    this.set('addressLine1', null);
    this.set('addressLine2', null);
  }

  /**
   * Returns a plain old javascript object with the attributes filled in as keys, and the values as values
   */
  getPOJO(){
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

  clearExceptAddressLines(){
    this.set('countryCode', null);
    this.set('administrativeArea', null);
    this.set('locality', null);
    this.set('dependentLocality', null);
    this.set('postalCode', null);
    this.set('sortingCode', null);
  }

  @computed('countryCode', 'administrativeArea', 'locality', 'dependentLocality', 'postalCode', 'sortingCode', 'addressLine1', 'addressLine2')
  get isBlankModel() : boolean {
    return isBlank(this.countryCode) &&
      isBlank(this.administrativeArea) &&
      isBlank(this.locality) &&
      isBlank(this.dependentLocality) &&
      isBlank(this.postalCode) &&
      isBlank(this.sortingCode) &&
      isBlank(this.addressLine1) &&
      isBlank(this.addressLine2);
  }

  @computed('format', 'countryCode', 'administrativeArea', 'locality', 'dependentLocality', 'postalCode', 'sortingCode', 'addressLine1', 'addressLine2')
  get isValidModel() : boolean {
    const ignoreFields = ['organization', 'givenName', 'additionalName', 'familyName'];
    let returnValue = true;

    if(!isBlank(this.format)) {
      const requiredFields = this.format.data.attributes['required-fields'];
      requiredFields.some((requiredField) => {
        if(!ignoreFields.includes(requiredField)){
          if(isBlank(this.get(requiredField))) {
            returnValue = false;
            return !returnValue;
          }
        }
      });
    }

    return returnValue;
  }
}
