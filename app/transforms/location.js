import DS from 'ember-data';

const { isBlank } = Ember;
const { Transform } = DS;

export default Transform.extend({
  deserialize: function(serialized) {
    let location = {};

    if(!isBlank(serialized)) {
      location.lat = serialized.lat;
      location.lng = serialized.lng;
    }

    return location;
  },
  serialize: function(deserialized) {
    let serializedLocation = {};

    if(!isBlank(deserialized)) {
      serializedLocation['lat'] = deserialized.lat;
      serializedLocation['lng'] = deserialized.lng;
    }

    return serializedLocation;
  }
});
