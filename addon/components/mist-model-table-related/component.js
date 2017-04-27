/* jshint noyield:true */
import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import ModelTasksMixin from 'ember-mist-components/mixins/model-tasks';
import { task } from 'ember-concurrency';

const { Component, computed, inject } = Ember;
const { dasherize } = Ember.String;

export default Component.extend(ModelTasksMixin, {
  tagName: '',
  entityCache: inject.service(),
  store: inject.service(),

  modelType: computed('model', 'field', function(){
    return ModelUtils.getChildModelTypeName(this.get('model'), this.get('field'));
  }),
  parentField: computed('model', 'field', function(){
    return ModelUtils.getRelationshipInverse(this.get('model'), this.get('field'));
  }),
  filters: computed('model', 'parentField', function(){
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
  })
});
