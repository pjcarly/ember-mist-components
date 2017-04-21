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
    streetChanged(value) {
      this.get('address').set('street', value);
    },
    postalCodeChanged(value) {
      this.get('address').set('postalCode', value);
    },
    cityChanged(value) {
      this.get('address').set('city', value);
    },
    stateChanged(value) {
      this.get('address').set('state', value);
    },
    countryChanged(value) {
      this.get('address').set('country', value);
    }
  }
});
