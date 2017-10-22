import Ember from 'ember';
import ModelTasksMixin from 'ember-mist-components/mixins/model-tasks';
import { getChildModelTypeName, getRelationshipInverse} from 'ember-field-components/classes/model-utils';

const { Component } = Ember;
const { computed } = Ember;
const { inject } = Ember;
const { String } = Ember;
const { isBlank } = Ember;
const { service } = inject;
const { dasherize } = String;

export default Component.extend(ModelTasksMixin, {
  tagName: '',
  entityCache: service(),
  store: service(),

  modelType: computed('model', 'field', function(){
    return getChildModelTypeName(this.get('model'), this.get('field'));
  }),
  parentField: computed('model', 'field', function(){
    return getRelationshipInverse(this.get('model'), this.get('field'));
  }),
  filters: computed('model', 'parentField', function(){
    let filters = {};
    let parentField = dasherize(this.get('parentField'));

    filters[parentField] = this.get('model.id');
    return filters;
  }),
  preProcessNew(model){
    const hook = this.get('preProcessNewHook');
    if(!isBlank(hook)){
      hook(model);
    }
  },
  actions: {
    newFromRelated(){
      const modelType = this.get('modelType');
      const model = this.get('model');
      let cachedModel = this.get('store').createRecord(modelType);
      cachedModel.set(this.get('parentField'), model);
      this.preProcessNew(cachedModel);
      this.set('entityCache.cachedModel', cachedModel);
      this.set('entityCache.returnToModel', model);
      this.get('new').perform(modelType);
    }
  }
});
