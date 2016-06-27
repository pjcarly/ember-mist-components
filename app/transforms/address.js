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
    let serializedAddress = {}

    if(!Ember.isBlank(deserialized)) {
      serializedAddress['country_code'] = deserialized.get('country');
      serializedAddress['administrative_area'] = null;
      serializedAddress['locality'] = deserialized.get('city');
      serializedAddress['dependent_locality'] = null;
      serializedAddress['postal_code'] = deserialized.get('postalCode');
      serializedAddress['sorting_code'] = null;
      serializedAddress['address_line1'] = deserialized.get('street');
      serializedAddress['address_line2'] = null;
    }

    return serializedAddress;
  }
});
