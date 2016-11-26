import Ember from 'ember';

export default Ember.Object.extend({
  markers: null,
  field: null,
  model: null,
  lat: Ember.computed('model', 'field', {
    get(){
      let location = this.getLocationObject();
      return location.lat;
    },
    set(key, value){
      this.setObjectValue('lat', value);
      return value;
    }
  }),
  lng: Ember.computed('model', 'field', {
    get(){
      let location = this.getLocationObject();
      return location.lng;
    },
    set(key, value){
      this.setObjectValue('lng', value);
      return value;
    }
  }),
  setObjectValue(objectField, value){
    let newLocation = this.getLocationObject();
    newLocation[objectField] = value;

    this.get('model').set(this.get('field'), newLocation);
  },
  getLocationObject(){
    let location = this.get('model').get(this.get('field'));
    if(Ember.isBlank(location)){
      location = {};
      location.lat = null;
      location.lng = null;
      this.get('model').set(this.get('field'), location);
    }
    let newLocation = {};
    newLocation['lat'] = location.lat;
    newLocation['lng'] = location.lng;
    return newLocation;
  },
  addMarker(mapName, marker){
    let markers = this.get('markers');

    if(Ember.isBlank(markers)){
      markers = {};
    }

    markers[mapName] = marker;
    this.markers = markers;
  },
  removeMarker(mapName) {
    let markers = this.get('markers');

    if(!Ember.isBlank(markers) && markers.hasOwnProperty(mapName)){
      delete markers[mapName];
    }

    this.markers = markers;
  },
  getMarker(mapName) {
    let markers = this.get('markers');

    if(!Ember.isBlank(markers) && markers.hasOwnProperty(mapName)){
      return markers[mapName];
    }
  }
});
