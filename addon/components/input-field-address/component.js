import Ember from 'ember';
import Address from 'ember-mist-components/classes/address';

export default Ember.Component.extend({
  tagName: '',

  address: Ember.computed('model', 'field', function(){
    let address = this.get('model').getAddress(this.get('field'));
    return address;
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
