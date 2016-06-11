import Ember from 'ember';
import GMaps from 'ember-cli-g-maps/components/g-maps'

export default GMaps.extend({
  setBounds: false,

  setStyles() {
    let styles = this.get('styles');

    if(!Ember.isBlank(styles)) {
      let map = this.get('map.map');
      map.set('styles', styles);
    }
  },

  setModels() {
    let mapName = this.get('name');
    let models = this.get('models');
    let field = this.get('field');
    let oldMistMarkers = this.get('mistMarkers');
    let mistMarkers = {};

    let infowindow = new google.maps.InfoWindow();

    if(!Ember.isBlank(models) && !Ember.isBlank(field) && !Ember.isBlank(mapName)) {
      let map = this.get('map.map');

      models.forEach((model) => {
        let modelGuid = Ember.guidFor(model);
        let modelLocation = model.get(field);
        let latLng = modelLocation.get('googleMapsLatLng');
        let marker = null;

        if(!Ember.isBlank(latLng)){
          if(!Ember.isBlank(oldMistMarkers) && oldMistMarkersoldMistMarkers.hasOwnProperty(modelGuid)){
            marker = oldMistMarkers[modelGuid];
            delete oldMistMarkers[modelGuid];
          } else {
            marker = new google.maps.Marker({
              map: map,
              icon: 'assets/images/map-marker-purple.png'
            });

            marker.addListener('click', function() {
              let content = `<h4>${model.get('title')}</h4><div class="btn-demo"><button class="btn btn-default btn-icon-text waves-effect"><i class="zmdi zmdi-arrow-forward"></i> go to details</button></div>`;
              infowindow.setContent(content);
              infowindow.open(map, marker);
            });
          }

          modelLocation.addMarker(mapName, marker);
          marker.setPosition(latLng);
          mistMarkers[modelGuid] = marker;
        }
      });
    }

    for(let property in oldMistMarkers) {
      if(oldMistMarkers.hasOwnProperty(property)) {
        let marker = oldMistMarkers[property];
        modelLocation.removeMarker(mapName);
        marker.setMap(null);
      }
    }

    this.set('mistMarkers', mistMarkers);
  },

  willDestroyElement() {
    this._super(...arguments);

    let mapName = this.get('name');
    let models = this.get('models');
    let field = this.get('field');

    if(!Ember.isBlank(models) && !Ember.isBlank(field) && !Ember.isBlank(mapName)) {
      models.forEach((model) => {
        model.get(field).removeMarker(mapName);
      });
    }
  },

  setMapBounds() {
    if(this.get('setBounds')) {
      let map = this.get('map.map');
      let mistMarkers = this.get('mistMarkers');
      let bounds = new google.maps.LatLngBounds();

      for(let property in mistMarkers) {
        if(mistMarkers.hasOwnProperty(property)) {
          let marker = mistMarkers[property];
          bounds.extend(marker.getPosition());
        }
      }

      map.fitBounds(bounds);
    }
  },

  actions: {
    loaded() {
      this.setStyles();
      this.setModels();
      this.setMapBounds();
    }
  }
});
