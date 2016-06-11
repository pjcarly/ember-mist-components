import DS from 'ember-data';
import Address from 'ember-mist-components/classes/address';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let address = Address.create();

    if(!Ember.isBlank(serialized)) {
      address.street = serialized.address_line1;
      address.postalCode = serialized.postal_code;
      address.city = serialized.locality;
      address.state = null;
      address.country = serialized.country_code;
    }

    return address;
  },
  serialize: function(deserialized) {
    let serializedAddress = {
      country_code: deserialized.get('country'),
      administrative_area: null,
      locality: deserialized.get('city'),
      dependent_locality: null,
      postal_code: deserialized.get('postalCode'),
      sorting_code: null,
      address_line1: deserialized.get('street'),
      address_line2: null
    };
    return serializedAddress;
  }
});
