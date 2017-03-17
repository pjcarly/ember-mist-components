import Ember from 'ember';
import { getModelName, getParentRoute, getModelType } from 'ember-field-components/classes/model-utils';

export default Ember.Service.extend({
  // beware, -routing is a private API, migrate once Routing as a Service is released:
  //https://github.com/emberjs/ember.js/issues/12719
  store: Ember.inject.service(),
  router: Ember.inject.service('-routing'),
  transitionToView: function(model){
    this.transitionToModelRoute(model, 'view');
  },
  transitionToEdit: function(model){
    this.transitionToModelRoute(model, 'edit');
  },
  transitionToDelete: function(model){
    this.transitionToModelRoute(model, 'delete');
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
  },
  transitionToModelRoute: function(model, route) {
    const modelName = getModelName(model);
    const parentRoute = getParentRoute(model);
    let routePrefix = '';
    if(!Ember.isBlank(parentRoute)){
      routePrefix = `${parentRoute}.`;
    }
    this.get('router').transitionTo(`${routePrefix}${modelName}.${route}`, [model.get('id')]);
  }
});
