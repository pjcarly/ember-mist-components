import Ember from 'ember';
import { getModelName } from 'ember-field-components/classes/model-utils';

export default Ember.Service.extend({
  // beware, -routing is a private API, migrate once Routing as a Service is released:
  //https://github.com/emberjs/ember.js/issues/12719
  router: Ember.inject.service('-routing'),
  transitionToView: function(model){
    let modelName = getModelName(model);
    this.get('router').transitionTo(`${modelName}.view`, [model.get('id')]);
  },
  transitionToEdit: function(model){
    let modelName = getModelName(model);
    this.get('router').transitionTo(`${modelName}.edit`, [model.get('id')]);
  },
  transitionToDelete: function(model){
    let modelName = getModelName(model);
    this.get('router').transitionTo(`${modelName}.delete`, [model.get('id')]);
  },
  transitionToCreate: function(modelType){
    this.get('router').transitionTo(`${modelType}.new`);
  },
  transitionToList: function(modelType){
    this.get('router').transitionTo(`${modelType}`);
  }
});
