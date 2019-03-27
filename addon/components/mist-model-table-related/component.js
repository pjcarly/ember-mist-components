import QueryCondition from 'ember-mist-components/classes/query-condition';
import Component from '@ember/component';
import { getChildModelTypeName, getRelationshipInverse } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { dasherize } from '@ember/string';

export default Component.extend({
  tagName: '',
  entityCache: service(),
  entityRouter: service(),
  store: service(),

  modelType: computed('model', 'field', function(){
    return getChildModelTypeName(this.get('model'), this.get('field'));
  }),
  parentField: computed('model', 'field', function(){
    return getRelationshipInverse(this.get('model'), this.get('field'));
  }),
  filters: computed('model', 'parentField', function(){
    const filters = [];
    const filter = QueryCondition.create();
    filter.set('field', dasherize(this.get('parentField')));
    filter.set('operator', '=');
    filter.set('id', this.get('model.id'));
    filters.push(filter);
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
      this.get('entityRouter').transitionToCreate(modelType);
    }
  }
});
