import Ember from 'ember';
import Location from 'ember-mist-components/classes/location';
import Address from 'ember-mist-components/classes/address';

const { Mixin, on, computed } = Ember;

export default Mixin.create({
  setDefaultValuesForAttributes: on('didLoad', 'didUpdate', function(){
    this.eachAttribute((name, attribute) => {
      if(attribute.type === 'location'){
        const currentValue = this.get(name);

        let locations = this.get('locations');
        let location = Location.create();
        location.model = this;
        location.field = name;
        location.set('lat', currentValue.hasOwnProperty('lat') ? currentValue.lat : null);
        location.set('lng', currentValue.hasOwnProperty('lng') ? currentValue.lng : null);
        locations[name] = location;
      } else if(attribute.type === 'address'){
        const currentValue = this.get(name);
        let addresses = this.get('addresses');
        let address = Address.create();
        address.model = this;
        address.field = name;
        address.set('street', currentValue.hasOwnProperty('street') ? currentValue.street : null);
        address.set('city', currentValue.hasOwnProperty('city') ? currentValue.city : null);
        address.set('postalCode', currentValue.hasOwnProperty('postalCode') ? currentValue.postalCode : null);
        address.set('state', currentValue.hasOwnProperty('state') ? currentValue.state : null);
        address.set('country', currentValue.hasOwnProperty('country') ? currentValue.country : null);
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
