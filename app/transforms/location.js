import DS from 'ember-data';
import Location from 'ember-mist-components/classes/location';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let location = Location.create();
    
    if(!Ember.isBlank(serialized)) {
      location.lat = serialized.lat;
      location.lng = serialized.lng;
    }

    return location;
  },
  serialize: function(deserialized) {
    let serializedLocation = {
      lat: deserialized.get('lat'),
      lng: deserialized.get('lng')
    };
    return serializedLocation;
  }
});
