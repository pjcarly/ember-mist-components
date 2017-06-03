import Ember from 'ember';
import Location from 'ember-mist-components/classes/location';
import Address from 'ember-mist-components/classes/address';

const { Mixin, on, computed, isBlank } = Ember;

export default Mixin.create({
  setDefaultValuesForAttributes: on('ready', function(){
    this.eachAttribute((name, attribute) => {
      if(attribute.type === 'location'){
        const currentValue = this.get(name);

        let locations = this.get('locations');
        let location = Location.create();
        location.model = this;
        location.field = name;
        location.set('lat', (!isBlank(currentValue) && currentValue.hasOwnProperty('lat')) ? currentValue.lat : null);
        location.set('lng', (!isBlank(currentValue) && currentValue.hasOwnProperty('lng')) ? currentValue.lng : null);
        locations[name] = location;
      } else if(attribute.type === 'address'){
        const currentValue = this.get(name);
        let addresses = this.get('addresses');
        let address = Address.create();
        address.model = this;
        address.field = name;
        address.set('countryCode', (!isBlank(currentValue) && currentValue.hasOwnProperty('countryCode')) ? currentValue.countryCode : null);
        address.set('administrativeArea', (!isBlank(currentValue) && currentValue.hasOwnProperty('administrativeArea')) ? currentValue.administrativeArea : null);
        address.set('locality', (!isBlank(currentValue) && currentValue.hasOwnProperty('locality')) ? currentValue.locality : null);
        address.set('dependentLocality', (!isBlank(currentValue) && currentValue.hasOwnProperty('dependentLocality')) ? currentValue.dependentLocality : null);
        address.set('postalCode', (!isBlank(currentValue) && currentValue.hasOwnProperty('postalCode')) ? currentValue.postalCode : null);
        address.set('sortingCode', (!isBlank(currentValue) && currentValue.hasOwnProperty('sortingCode')) ? currentValue.sortingCode : null);
        address.set('addressLine1', (!isBlank(currentValue) && currentValue.hasOwnProperty('addressLine1')) ? currentValue.addressLine1 : null);
        address.set('addressLine2', (!isBlank(currentValue) && currentValue.hasOwnProperty('addressLine2')) ? currentValue.addressLine2 : null);
        addresses[name] = address;
      }
    });
  }),

  locations: computed('_locations', function(){
    let locations = this.get('_locations');
    if(locations === undefined){
      locations = {};
      this.set('_locations', locations);
    }
    return locations;
  }),

  addresses: computed('_addresses', function(){
    let addresses = this.get('_addresses');
    if(addresses === undefined){
      addresses = {};
      this.set('_addresses', addresses);
    }
    return addresses;
  }),

  getLocation(name){
    let locations = this.get('locations');
    if(locations.hasOwnProperty(name)){
      return locations[name];
    }
    return null;
  },
  getAddress(name){
    let addresses = this.get('addresses');
    if(addresses.hasOwnProperty(name)){
      return addresses[name];
    }
    return null;
  }
});
