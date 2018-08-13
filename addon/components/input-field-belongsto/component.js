/* jshint noyield:true */
import Ember from 'ember';
import DS from 'ember-data';
import ComponentFieldTypeMixin from 'ember-field-components/mixins/component-field-type';
import OfflineModelCacheMixin from 'ember-mist-components/mixins/offline-model-cache';
import DynamicObserverComponent from 'ember-field-components/mixins/component-dynamic-observer';

import { getParentModelTypeNames, hasWidget, getParentModelType, getParentModelTypeName, modelTypeIsCacheable } from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { inject } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { assert } = Ember;
const { service } = inject;
const { Model } = DS;

export default Component.extend(ComponentFieldTypeMixin, OfflineModelCacheMixin, DynamicObserverComponent, {
  tagName: '',
  store: service(),
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  setInitialValue: task(function * (){
    const { field, model, store, storage, fieldId, isPolymorphic } = this.getProperties('field', 'model', 'store', 'storage', 'fieldId', 'isPolymorphic');
    let relationshipTypeName = this.get('relationshipModelType');

    // This can potentially be an array of modeltypenames in case of a polymorphic relationship
    if(isPolymorphic){
      for(const singleRelationshipTypeName of relationshipTypeName){
        yield this.get('checkOfflineCache').perform(store, storage, singleRelationshipTypeName);
      }
    } else {
      yield this.get('checkOfflineCache').perform(store, storage, relationshipTypeName);
    }

    if(!isBlank(fieldId)){
      if(isPolymorphic){
        // AAARGGHH private ED api, watch out!
        relationshipTypeName = model.belongsTo(field).belongsToRelationship.inverseInternalModel.modelName;
      }

      if(store.hasRecordForId(relationshipTypeName, fieldId)){
        this.set('lookupValue', store.peekRecord(relationshipTypeName, fieldId));
      } else {
        yield model.get(field).then((value) => {
          this.set('lookupValue', value);
        });
      }
    }

    if(this.get('isSelect')){
      yield this.get('setSelectOptions').perform();
    }
  }).drop(),
  valueObserver() {
    // TODO: Known bug. code enters twice
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  relationshipModelType: computed('model', 'field', function(){
    if(this.get('isPolymorphic')){
      return getParentModelTypeNames(this.get('model'), this.get('field'));
    } else {
      return getParentModelTypeName(this.get('model'), this.get('field'));
    }
  }),
  isRequired: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');
    return options.hasOwnProperty('validation') && options.validation.hasOwnProperty('required') && options.validation.required;
  }),
  isPolymorphic: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');
    return options.hasOwnProperty('polymorphic') && options.polymorphic;
  }),
  fieldId: computed('model', 'field', function(){
    return this.get('model').belongsTo(this.get('field')).id();
  }),
  isSelect: computed(function(){
    return hasWidget(this.get('relationshipAttributeOptions'), 'select');
  }),
  filters: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');

    if(options.filters){
      return options.filters;
    }

    return [];
  }),
  setSelectOptions: task(function * (){
    const store = this.get('store');
    const relationshipType = getParentModelType(this.get('model'), this.get('field'), store);
    const relationshipTypeName = this.get('relationshipModelType');

    assert('Select widget is only supported for Offline cacheable models', modelTypeIsCacheable(relationshipType));
    assert('Select widget is not supported for polymorphic relationships', !this.get('isPolymorphic'));

    const models = store.peekAll(relationshipTypeName);

    let selectOptions = [];
    models.forEach((model) => {
      let selectOption = {};
      selectOption.value = model.get('id');
      selectOption.label = model.get('name');
      selectOptions.push(selectOption);
    });

    this.set('selectOptions', selectOptions);
  }).drop(),
  noChoiceAvailable: computed('selectOptions', 'value', function(){
    const selectOptions = this.get('selectOptions');
    return (selectOptions.get('length') === 1) && selectOptions[0].value === this.get('fieldId');
  }),
  actions: {
    valueChanged: function(value){
      const { field, model } = this.getProperties('field', 'model');

      if(!isBlank(value)) {
        if(!(value instanceof Model)) {
          // Not with polymorphic relationships
          assert('Select widget is not supported for polymorphic relationships', !this.get('isPolymorphic'));

          // we might have an Id instead of a model, happens when using Select widget
          const relationshipType = getParentModelType(model, field, this.get('store'));

          // only usable with cached data
          assert('Value assign based on ID is only usable with cached models', modelTypeIsCacheable(relationshipType));

          // and it should already be available in the store
          const relationshipTypeName = this.get('relationshipModelType');
          let foundModel = this.get('store').peekRecord(relationshipTypeName, value);
          assert(`Model with id: ${value} and type: ${relationshipTypeName} not found in store`, !isBlank(foundModel));

          value = foundModel;
        }
      }

      model.set(field, value);

      if(this.get('valueChanged')){
        this.get('valueChanged')(...arguments);
      }

      // And finally clear potential Errors
      let errors = model.get('errors');
      errors.remove(field);
    }
  }
});
