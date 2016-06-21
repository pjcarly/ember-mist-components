import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  address: Ember.computed('model', 'field', function(){
    return this.get('model').get(this.get('field'));
  }),
  actions: {
    streetChanged(value) {
      this.set('address.street', value);
    },
    postalCodeChanged(value) {
      this.set('address.postalCode', value);
    },
    cityChanged(value) {
      this.set('address.city', value);
    },
    stateChanged(value) {
      this.set('address.state', value);
    },
    countryChanged(value) {
      this.set('address.country', value);
    }
  }
});
