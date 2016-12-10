import Ember from 'ember';
import { getModelName, getParentRoute } from 'ember-field-components/classes/model-utils';

export default Ember.Service.extend({
  // beware, -routing is a private API, migrate once Routing as a Service is released:
  //https://github.com/emberjs/ember.js/issues/12719
  router: Ember.inject.service('-routing'),
  transitionToView: function(model){
    const modelName = getModelName(model);
    const parentRoute = getParentRoute(model);
    let routePrefix = '';
    if(!Ember.isBlank(parentRoute)){
      routePrefix = `${parentRoute}.`;
    }
    this.get('router').transitionTo(`${routePrefix}${modelName}.view`, [model.get('id')]);
  },
  transitionToEdit: function(model){
    const modelName = getModelName(model);
    const parentRoute = getParentRoute(model);
    let routePrefix = '';
    if(!Ember.isBlank(parentRoute)){
      routePrefix = `${parentRoute}.`;
    }
    this.get('router').transitionTo(`${routePrefix}${modelName}.edit`, [model.get('id')]);
  },
  transitionToDelete: function(model){
    const modelName = getModelName(model);
    const parentRoute = getParentRoute(model);
    let routePrefix = '';
    if(!Ember.isBlank(parentRoute)){
      routePrefix = `${parentRoute}.`;
    }
    this.get('router').transitionTo(`${routePrefix}${modelName}.delete`, [model.get('id')]);
  },
  transitionToCreate: function(modelType){
    this.get('router').transitionTo(`${modelType}.new`);
  },
  transitionToList: function(modelType){
    this.get('router').transitionTo(`${modelType}`);
  }
});
