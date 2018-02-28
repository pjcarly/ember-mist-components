import Ember from 'ember';
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
const { computed } = Ember;
const { isBlank } = Ember;

export default Fragment.extend({
  countryCode: attr('string'),
  administrativeArea: attr('string'),
  locality: attr('string'),
  dependentLocality: attr('string'),
  postalCode: attr('string'),
  sortingCode: attr('string'),
  addressLine1: attr('string'),
  addressLine2: attr('string'),
  copyAddress(){
    let newAddress = this.get('store').createFragment('address');
    newAddress.set('countryCode', this.get('countryCode'));
    newAddress.set('administrativeArea', this.get('administrativeArea'));
    newAddress.set('locality', this.get('locality'));
    newAddress.set('dependentLocality', this.get('dependentLocality'));
    newAddress.set('postalCode', this.get('postalCode'));
    newAddress.set('sortingCode', this.get('sortingCode'));
    newAddress.set('addressLine1', this.get('addressLine1'));
    newAddress.set('addressLine2', this.get('addressLine2'));
    return newAddress;
  },
  clear(){
    this.set('countryCode', null);
    this.set('administrativeArea', null);
    this.set('locality', null);
    this.set('dependentLocality', null);
    this.set('postalCode', null);
    this.set('sortingCode', null);
    this.set('addressLine1', null);
    this.set('addressLine2', null);
  },
  getPOJO(){
    const pojo = {};
    pojo.countryCode = this.get('countryCode');
    pojo.administrativeArea = this.get('administrativeArea');
    pojo.locality = this.get('locality');
    pojo.dependentLocality = this.get('dependentLocality');
    pojo.postalCode = this.get('postalCode');
    pojo.sortingCode = this.get('sortingCode');
    pojo.addressLine1 = this.get('addressLine1');
    pojo.addressLine2 = this.get('addressLine2');
    return pojo;
  },
  clearExceptAddressLines(){
    this.set('countryCode', null);
    this.set('administrativeArea', null);
    this.set('locality', null);
    this.set('dependentLocality', null);
    this.set('postalCode', null);
    this.set('sortingCode', null);
  },
  isBlankModel: computed('countryCode', 'administrativeArea', 'locality', 'dependentLocality', 'postalCode', 'sortingCode', 'addressLine1', 'addressLine2', function(){
    const { countryCode, administrativeArea, locality, dependentLocality, postalCode, sortingCode, addressLine1, addressLine2 } = this.getProperties('countryCode', 'administrativeArea', 'locality', 'dependentLocality', 'postalCode', 'sortingCode', 'addressLine1', 'addressLine2');
    return isBlank(countryCode) && isBlank(administrativeArea) && isBlank(locality) && isBlank(dependentLocality) && isBlank(postalCode) && isBlank(sortingCode) && isBlank(addressLine1) && isBlank(addressLine2);
  }),
  isValidModel: computed('format', 'countryCode', 'administrativeArea', 'locality', 'dependentLocality', 'postalCode', 'sortingCode', 'addressLine1', 'addressLine2', function(){
    const { format } = this.getProperties('format');
    const ignoreFields = ['organization', 'givenName', 'additionalName', 'familyName'];
    let returnValue = false;

    if(isBlank(format)) {
      returnValue = false;
    } else {
      returnValue = true;
      const requiredFields = format.data.attributes['required-fields'];
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
  }),
});
