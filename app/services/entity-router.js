import Service from '@ember/service';
import { getModelName } from 'ember-field-components/classes/model-utils';
import { inject as service } from '@ember/service';

export default Service.extend({
  store: service(),
  router: service(),

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
    this.get('router').transitionTo(`${modelName}.${route}`, model.get('id'));
  }
});
