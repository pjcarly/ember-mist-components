import Ember from 'ember';
import { getModelName, getModelType } from 'ember-field-components/classes/model-utils';

const { Service } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Service.extend({
  // beware, -routing is a private API, migrate once Routing as a Service is released:
  //https://github.com/emberjs/Ember.js/issues/12719
  store: service(),
  router: service('-routing'),
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
    this.get('router').transitionTo(`${modelTypeName}.new`);
  },
  transitionToList: function(modelTypeName){
    this.get('router').transitionTo(`${modelTypeName}`);
  },
  transitionToModelRoute: function(model, route) {
    const modelName = getModelName(model);
    this.get('router').transitionTo(`${modelName}.${route}`, [model.get('id')]);
  }
});
