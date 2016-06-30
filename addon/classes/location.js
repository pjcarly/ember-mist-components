import Ember from 'ember';

export default Ember.Object.extend({
  lat: null,
  lng: null,
  markers: null,

  latLng: Ember.computed('lat', 'lng', function(){
    let lat = this.get('lat');
    let lng = this.get('lng');

    if(Ember.isBlank(lat) || Ember.isBlank(lng)){
      return '';
    }

    return `${lat}, ${lng}`;
  }),
  googleMapsLatLng: Ember.computed('lat', 'lng', function(){
    let lat = this.get('lat');
    let lng = this.get('lng');

    if(Ember.isBlank(lat) || Ember.isBlank(lng)){
      return null;
    }
    else {
      return new google.maps.LatLng(lat, lng);
    }
  }),
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
