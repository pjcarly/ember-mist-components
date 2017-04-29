/* global google */
import Ember from 'ember';
import GMaps from 'ember-cli-g-maps/components/g-maps';
import { getModelName } from 'ember-field-components/classes/model-utils';

const { inject, isBlank, observer, guidFor } = Ember;
const { service } = inject;

export default GMaps.extend({
  setBounds: false,
  router: service('-routing'),

  setStyles() {
    let styles = this.get('styles');

    if(!isBlank(styles)) {
      let map = this.get('map.map');
      map.set('styles', styles);
    }
  },

  modelsChangedObserver: observer('models', function(){
    // TODO: find a way to remove observer
    this.setModels();
    this.setMapBounds();
  }),

  setModels() {
    let mapName = this.get('name');
    let models = this.get('models');
    let field = this.get('field');

    let oldMistMarkers = this.get('mistMarkers');
    let mistMarkers = {};

    let infowindow = new google.maps.InfoWindow();

    if(!isBlank(models) && !isBlank(field) && !isBlank(mapName)) {
      let map = this.get('map.map');

      models.forEach((model) => {
        let modelGuid = guidFor(model);
        let modelLocation = model.getLocation(field);
        if(!isBlank(modelLocation)){
          let {lat, lng} = modelLocation.getProperties('lat', 'lng');
          let marker = null;

          if(!isBlank(lat) && !isBlank(lng)){
            let latLng = new google.maps.LatLng(lat, lng);
            if(!isBlank(oldMistMarkers) && oldMistMarkers.hasOwnProperty(modelGuid)){
              marker = oldMistMarkers[modelGuid];
              delete oldMistMarkers[modelGuid];
            } else {
              marker = new google.maps.Marker({
                map: map,
                icon: 'assets/images/map-marker-purple.png'
              });

              let route = `#/${getModelName(model)}/${model.get('id')}/view`;

              marker.addListener('click', function() {
                let content = `<h4>${model.get('name')}</h4><div class="infowindow-buttons"><a class="btn btn-default waves-effect" href="${route}"><i class="zmdi zmdi-arrow-forward"></i> View record</a></div>`;
                infowindow.setContent(content);
                infowindow.open(map, marker);
              });
            }

            modelLocation.addMarker(mapName, marker);
            marker.setPosition(latLng);
            mistMarkers[modelGuid] = marker;
          }
        }
      });
    }

    for(let property in oldMistMarkers) {
      if(oldMistMarkers.hasOwnProperty(property)) {
        let marker = oldMistMarkers[property];
        //modelLocation.removeMarker(mapName);
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

    if(!isBlank(models) && !isBlank(field) && !isBlank(mapName)) {
      models.forEach((model) => {
        let location = model.getLocation(field);
        if(!isBlank(location)){
          location.removeMarker(mapName);
        }
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
