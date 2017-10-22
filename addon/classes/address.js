import Ember from 'ember';

const { Object } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;

export default Object.extend({
  model: null,
  field: null,
  countryCode: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.countryCode;
    },
    set(key, value){
      this.setObjectValue('countryCode', value);
      return value;
    }
  }),
  administrativeArea: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.administrativeArea;
    },
    set(key, value){
      this.setObjectValue('administrativeArea', value);
      return value;
    }
  }),
  locality: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.locality;
    },
    set(key, value){
      this.setObjectValue('locality', value);
      return value;
    }
  }),
  dependentLocality: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.dependentLocality;
    },
    set(key, value){
      this.setObjectValue('dependentLocality', value);
      return value;
    }
  }),
  postalCode: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.postalCode;
    },
    set(key, value){
      this.setObjectValue('postalCode', value);
      return value;
    }
  }),
  sortingCode: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.sortingCode;
    },
    set(key, value){
      this.setObjectValue('sortingCode', value);
      return value;
    }
  }),
  addressLine1: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.addressLine1;
    },
    set(key, value){
      this.setObjectValue('addressLine1', value);
      return value;
    }
  }),
  addressLine2: computed('model', 'field', {
    get(){
      let address = this.getAddressObject();
      return address.addressLine2;
    },
    set(key, value){
      this.setObjectValue('addressLine2', value);
      return value;
    }
  }),
  clear(){
    let address = this.getAddressObject();
    address.countryCode = null;
    address.administrativeArea = null;
    address.locality = null;
    address.dependentLocality = null;
    address.postalCode = null;
    address.sortingCode = null;
    address.addressLine1 = null;
    address.addressLine2 = null;
    this.get('model').set(this.get('field'), address);
    this.notifyPropertyChange('field'); // So the above computed properties recalculate
  },
  clearExceptAddressLines(){
    let address = this.getAddressObject();
    address.countryCode = null;
    address.administrativeArea = null;
    address.locality = null;
    address.dependentLocality = null;
    address.postalCode = null;
    address.sortingCode = null;
    this.get('model').set(this.get('field'), address);
    this.notifyPropertyChange('field'); // So the above computed properties recalculate
  },
  setObjectValue(objectField, value){
    let newAddress = this.getAddressObject();
    newAddress[objectField] = value;

    this.get('model').set(this.get('field'), newAddress);
  },
  getAddressObject(){
    let address = this.get('model').get(this.get('field'));
    if(isBlank(address)){
      address = {};
      address.countryCode = null;
      address.administrativeArea = null;
      address.locality = null;
      address.dependentLocality = null;
      address.postalCode = null;
      address.sortingCode = null;
      address.addressLine1 = null;
      address.addressLine2 = null;
      this.get('model').set(this.get('field'), address);
    }

    let newAddress = {};
    newAddress['countryCode'] = address.countryCode;
    newAddress['administrativeArea'] = address.administrativeArea;
    newAddress['locality'] = address.locality;
    newAddress['dependentLocality'] = address.dependentLocality;
    newAddress['postalCode'] = address.postalCode;
    newAddress['sortingCode'] = address.sortingCode;
    newAddress['addressLine1'] = address.addressLine1;
    newAddress['addressLine2'] = address.addressLine2;

    return newAddress;
  },
});
