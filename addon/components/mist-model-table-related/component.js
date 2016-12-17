/* jshint noyield:true */
import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import ModelTasksMixin from 'ember-mist-components/mixins/model-tasks';
import { task } from 'ember-concurrency';

const { dasherize } = Ember.String;

export default Ember.Component.extend(ModelTasksMixin, {
  tagName: '',
  entityCache: Ember.inject.service(),
  store: Ember.inject.service(),

  modelType: Ember.computed('model', 'field', function(){
    return ModelUtils.getChildModelTypeName(this.get('model'), this.get('field'));
  }),
  parentField: Ember.computed('model', 'field', function(){
    return ModelUtils.getRelationshipInverse(this.get('model'), this.get('field'));
  }),
  filters: Ember.computed('model', 'parentField', function(){
    let filters = {};
    let parentField = dasherize(this.get('parentField'));

    filters[parentField] = this.get('model.id');
    return filters;
  }),
  newFromRelated: task(function * () {
    const modelType = this.get('modelType');
    const model = this.get('model');
    let cachedModel = this.get('store').createRecord(modelType);
    cachedModel.set(this.get('parentField'), model);
    this.set('entityCache.cachedModel', cachedModel);
    this.set('entityCache.returnToModel', model);
    this.get('new').perform(modelType);
  }).group('modelTasks'),
});
