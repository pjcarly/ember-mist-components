import Ember from 'ember';
import { getCountrySelectOptions } from 'ember-mist-components/classes/address';
const { Component, computed } = Ember;

export default Component.extend({
  tagName: '',

  address: computed('model', 'field', function(){
    let address = this.get('model').getAddress(this.get('field'));
    return address;
  }),
  countrySelectOptions: computed(function(){
    return getCountrySelectOptions();
  }),
  actions: {
    countryCodeChanged(value) {
      this.get('address').set('countryCode', value);
    },
    administrativeAreaChanged(value) {
      this.get('address').set('administrativeArea', value);
    },
    localityChanged(value) {
      this.get('address').set('locality', value);
    },
    dependentLocalityChanged(value) {
      this.get('address').set('dependentLocality', value);
    },
    postalCodeChanged(value) {
      this.get('address').set('postalCode', value);
    },
    sortingCodeChanged(value) {
      this.get('address').set('sortingCode', value);
    },
    addressLine1Changed(value) {
      this.get('address').set('addressLine1', value);
    },
    addressLine2Changed(value) {
      this.get('address').set('addressLine2', value);
    }
  }
});
