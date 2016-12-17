import Ember from 'ember';
import DS from 'ember-data';
import ComponentFieldTypeMixin from 'ember-field-components/mixins/component-field-type';

import ModelUtils from 'ember-field-components/classes/model-utils';
import OfflineModelCacheMixin from 'ember-mist-components/mixins/offline-model-cache';

import { task } from 'ember-concurrency';

export default Ember.Component.extend(ComponentFieldTypeMixin, OfflineModelCacheMixin, {
  tagName: '',
  store: Ember.inject.service(),
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  relationshipModelType: Ember.computed('model', 'field', function(){
    return ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));
  }),
  setInitialValue: task(function * (){
    const { field, model, store, storage, fieldId } = this.getProperties('field', 'model', 'store', 'storage', 'fieldId');
    const relationshipTypeName = ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));

    yield this.get('checkOfflineCache').perform(store, storage, relationshipTypeName);

    if(!Ember.isBlank(fieldId)){
      const relationshipTypeName = ModelUtils.getParentModelTypeName(model, field);

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
  }),
  isRequired: Ember.computed('relationshipAttributeOptions', function(){
    return this.get('relationshipAttributeOptions').validation.required
  }),
  fieldId: Ember.computed('model', 'field', function(){
    return this.get('model').belongsTo(this.get('field')).id();
  }),
  isSelect: Ember.computed(function(){
    return ModelUtils.hasWidget(this.get('relationshipAttributeOptions'), 'select');
  }),
  setSelectOptions: task(function * (){
    const store = this.get('store');
    const relationshipType = ModelUtils.getParentModelType(this.get('model'), this.get('field'), store);
    const relationshipTypeName = ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));

    let models;
    if(ModelUtils.modelTypeIsCacheable(relationshipType)){
      // should have been previously loaded, we can just use peekAll
      models = store.peekAll(relationshipTypeName);
    } else {
      Ember.assert('Select widget is only supported for Offline cacheable models');
    }

    let selectOptions = [];
    models.forEach((model) => {
      let selectOption = {};
      selectOption.value = model.get('id');
      selectOption.label = model.get('name');
      selectOptions.push(selectOption);
    });

    this.set('selectOptions', selectOptions);
  }),
  noChoiceAvailable: Ember.computed('selectOptions', 'value', function(){
    const selectOptions = this.get('selectOptions');
    return (selectOptions.get('length') === 1) && selectOptions[0].value === this.get('fieldId');
  }),
  actions: {
    valueChanged: function(value){
      const { field, model } = this.getProperties('field', 'model');

      if(!Ember.isBlank(value)) {
        if(!(value instanceof DS.Model)) {
          // we might have an Id instead of a model, happens when using Select widget
          const relationshipType = ModelUtils.getParentModelType(model, field, this.get('store'));
          if(ModelUtils.modelTypeIsCacheable(relationshipType)) {
            // only usable with cached data
            // and it should already be available in the store
            const relationshipTypeName = ModelUtils.getParentModelTypeName(model, field);
            let foundModel = this.get('store').peekRecord(relationshipTypeName, value);
            Ember.assert(`Model with id: ${value} and type: ${relationshipTypeName} not found in store`, !Ember.isBlank(foundModel));

            value = foundModel;
          } else {
            Ember.assert('Value assign based on ID is only usable with cached models');
          }
        }
      }

      model.set(field, value);
      this.set('lookupValue', value);
    }
  }
});
