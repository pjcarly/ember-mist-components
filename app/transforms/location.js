import DS from 'ember-data';
import Location from 'ember-mist-components/classes/location';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let location = {};

    if(!Ember.isBlank(serialized)) {
      location.lat = serialized.lat;
      location.lng = serialized.lng;
    }

    return location;
  },
  serialize: function(deserialized) {
    let serializedLocation = {};

    if(!Ember.isBlank(deserialized)) {
      serializedLocation['lat'] = deserialized.lat;
      serializedLocation['lng'] = deserialized.lng;
    }

    return serializedLocation;
  }
});
