import Ember from 'ember';
import ComponentDynamicObserverMixin from 'ember-field-components/mixins/component-dynamic-observer';

export default Ember.Component.extend(ComponentDynamicObserverMixin, {
  tagName: '',
  internalUpdate: false,
  draggable: true,

  init(){
    this._super(...arguments);

    this.set('zoom', 1);
    let location = this.get('location');
    if(!Ember.isBlank(location.get('lat')) && !Ember.isBlank(location.get('lng'))){
      this.setLatLng(location.get('lat'), location.get('lng'));
      this.set('zoom', 16);
    }

    this.setMarkers();
  },

  valueObserver: function(){
    Ember.run.once(() => {
      const internalUpdate = this.get('internalUpdate');

      if(!internalUpdate){
        this.notifyPropertyChange('field');
        let location = this.get('location');
        this.setLatLng(location.get('lat'), location.get('lng'));
        this.setMarkers();
      }
    });
  },

  setLatLng(lat, lng){
    this.set('internalUpdate', true);
    this.set('lat', lat);
    this.set('lng', lng);
    this.set('internalUpdate', false);
  },

  setMarkers(){
    let {lat, lng} = this.getProperties('lat', 'lng');
    let markers = [];

    if(Ember.isBlank(lat) || Ember.isBlank(lng)){
      lat = 0;
      lng = 0;
      this.set('zoom', 1);
    } else {
      if(this.get('zoom') === 1){
        this.set('zoom', 16);
      }
    }

    markers = [{
      id: 'unique-id',
      lat: lat,
      lng: lng,
      dragend: function(event, marker) {
        this.markerChangedPosition(event, marker);
      }.bind(this),
      cursor: 'pointer',
      draggable: this.get('draggable')
    }];

    this.set('markers', markers);
  },
  markerChangedPosition(event, marker) {
    this.set('internalUpdate', true);
    this.set('location.lat', marker.position.lat());
    this.set('location.lng', marker.position.lng());
    this.set('internalUpdate', false);
    this.setLatLng(marker.position.lat(), marker.position.lng());
  },
  location: Ember.computed('model', 'field', function(){
    let location = this.get('model').getLocation(this.get('field'));
    return location;
  })
});
