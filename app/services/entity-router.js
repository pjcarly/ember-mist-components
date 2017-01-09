import Ember from 'ember';
import { getModelName, getParentRoute, getModelType } from 'ember-field-components/classes/model-utils';

export default Ember.Service.extend({
  // beware, -routing is a private API, migrate once Routing as a Service is released:
  //https://github.com/emberjs/ember.js/issues/12719
  store: Ember.inject.service(),
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
  transitionToCreate: function(modelTypeName){
    const modelType = getModelType(modelTypeName, this.get('store'));
    if(!Ember.isBlank(modelType.parentRoute)){
      this.get('router').transitionTo(`${modelType.parentRoute}.${modelTypeName}.new`);
    } else {
      this.get('router').transitionTo(`${modelTypeName}.new`);
    }
  },
  transitionToList: function(modelTypeName){
    this.get('router').transitionTo(`${modelTypeName}`);
  }
});
