import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let address = {};

    if(!Ember.isBlank(serialized)) {
      address.street = serialized.street;
      address.postalCode = serialized['postal-code'];
      address.city = serialized.city;
      address.state = null;
      address.country = serialized.country;
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
      serializedAddress['country'] = deserialized.country;
      serializedAddress['city'] = deserialized.city;
      serializedAddress['postal-code'] = deserialized.postalCode;
      serializedAddress['street'] = deserialized.street;
    }

    return serializedAddress;
  }
});
