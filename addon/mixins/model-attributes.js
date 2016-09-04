import Ember from 'ember';
import Location from 'ember-mist-components/classes/location';
import Address from 'ember-mist-components/classes/address';

export default Ember.Mixin.create({
  setDefaultValuesForAttributes: Ember.on('ready', function(){
    this.eachAttribute((name, attribute) => {
      if(attribute.type === 'location'){
        let locations = this.get('locations');
        if(locations === undefined){
          locations = {};
          this.set('locations', locations);
        }
        let location = Location.create();
        location.model = this;
        location.field = name;
        locations[name] = location;
      } else if(attribute.type === 'address'){
        let addresses = this.get('addresses');
        if(addresses === undefined){
          addresses = {};
          this.set('addresses', addresses);
        }
        let address = Address.create();
        address.model = this;
        address.field = name;
        addresses[name] = address;
      }
    });
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
