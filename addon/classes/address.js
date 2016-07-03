import Ember from 'ember';

export default Ember.Object.extend({
  model: null,
  field: null,
  street: Ember.computed('model', 'field', {
    get(key){
      let address = this.getAddressObject();
      return address.street;
    },
    set(key, value){
      this.setObjectValue('street', value);
      return value;
    }
  }),
  city: Ember.computed('model', 'field', {
    get(key){
      let address = this.getAddressObject();
      return address.city;
    },
    set(key, value){
      this.setObjectValue('city', value);
      return value;
    }
  }),
  postalCode: Ember.computed('model', 'field', {
    get(key){
      let address = this.getAddressObject();
      return address.postalCode;
    },
    set(key, value){
      this.setObjectValue('postalCode', value);
      return value;
    }
  }),
  state: Ember.computed('model', 'field', {
    get(key){
      let address = this.getAddressObject();
      return address.state;
    },
    set(key, value){
      this.setObjectValue('state', value);
      return value;
    }
  }),
  country: Ember.computed('model', 'field', {
    get(key){
      let address = this.getAddressObject();
      return address.country;
    },
    set(key, value){
      this.setObjectValue('country', value);
      return value;
    }
  }),
  setObjectValue(objectField, value){
    let newAddress = this.getAddressObject();
    newAddress[objectField] = value;

    this.get('model').set(this.get('field'), newAddress);
  },
  getAddressObject(){
    let address = this.get('model').get(this.get('field'));
    if(Ember.isBlank(address)){
      address = {};
      address.street = null;
      address.city = null;
      address.postalCode = null;
      address.state = null;
      address.country = null;
      this.get('model').set(this.get('field'), address);
    }

    let newAddress = {};
    newAddress['street'] = address.street;
    newAddress['city'] = address.city;
    newAddress['postalCode'] = address.postalCode;
    newAddress['state'] = address.state;
    newAddress['country'] = address.country;
    return newAddress;
  },
});
