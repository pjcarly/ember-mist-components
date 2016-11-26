import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  location: Ember.computed('model', 'locationField', function(){
    let locationField = this.get('locationField');
    let location = null;

    if(!Ember.isBlank(locationField)){
      location = this.get('model').getLocation(locationField);
    }

    return location;
  }),
  address: Ember.computed('model', 'addressField', function(){
    let addressField = this.get('addressField');
    let address = null;

    if(!Ember.isBlank(addressField)){
      address = this.get('model').getAddress(addressField);
    }

    return address;
  }),
  actions: {
    didUpdatePlace(value) {
      let nameField = this.get('nameField');
      if(!Ember.isBlank(nameField)){
        this.get('model').set(nameField, value.place.name);
      }

      let websiteField = this.get('websiteField');
      if(!Ember.isBlank(websiteField)){
        this.get('model').set(websiteField, value.place.website);
      }

      let phoneField = this.get('phoneField');
      if(!Ember.isBlank(phoneField)){
        this.get('model').set(phoneField, value.place.international_phone_number);
      }

      let location = this.get('location');
      if(!Ember.isBlank(location)){
        location.set('lat', value.lat);
        location.set('lng', value.lng);
      }

      let address = this.get('address');
      if(!Ember.isBlank(address)){
        let street = '';
        let number = '';
        let state = '';

        value.place.address_components.forEach((addressComponent) => {
          if(addressComponent.types[0] === 'route'){
            street = addressComponent.long_name;
          } else if(addressComponent.types[0] === 'street_number'){
            number = addressComponent.long_name;
          } else if(addressComponent.types[0] === 'locality'){
            address.set('city', addressComponent.long_name);
          } else if(addressComponent.types[0] === 'country'){
            address.set('country', addressComponent.short_name);
          } else if(addressComponent.types[0] === 'postal_code'){
            address.set('postalCode', addressComponent.short_name);
          } else if(addressComponent.types[0] === 'administrative_area_level_2'){
            state = addressComponent.long_name;
          } else if(addressComponent.types[0] === 'administrative_area_level_1'){
            if(Ember.isBlank(state)){
              state = addressComponent.long_name;
            }
          }
        });

        if(!Ember.isBlank(number)) {
          street += ' ' + number;
        }

        address.set('street', street);
        address.set('state', state);
      }
    }
  }
});
