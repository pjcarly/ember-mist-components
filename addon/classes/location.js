import Ember from 'ember';

export default Ember.Object.extend({
  lat: null,
  lng: null,
  latLng: Ember.computed('lat', 'lng', function(){
    let lat = this.get('lat');
    let lng = this.get('lng');

    return `${lat}, ${lng}`;
  })
});
