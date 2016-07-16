import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let address = {};

    if(!Ember.isBlank(serialized)) {
      address.street = serialized.address_line1;
      address.postalCode = serialized.postal_code;
      address.city = serialized.locality;
      address.state = null;
      address.country = serialized.country_code;
    } else {
      address.street = null;
      address.postalCode = null;
      address.city = null;
      address.state = null;
      address.country = null;
    }

    return address;
  },
  serialize: function(deserialized) {
    let serializedAddress = {}

    if(!Ember.isBlank(deserialized)) {
      serializedAddress['country_code'] = deserialized.country;
      serializedAddress['administrative_area'] = null;
      serializedAddress['locality'] = deserialized.city;
      serializedAddress['dependent_locality'] = null;
      serializedAddress['postal_code'] = deserialized.postalCode;
      serializedAddress['sorting_code'] = null;
      serializedAddress['address_line1'] = deserialized.street;
      serializedAddress['address_line2'] = null;
    }

    return serializedAddress;
  }
});
