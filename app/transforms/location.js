import DS from 'ember-data';

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
