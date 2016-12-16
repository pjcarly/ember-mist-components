import Ember from 'ember';
import DS from 'ember-data';
import ComponentFieldTypeMixin from 'ember-field-components/mixins/component-field-type';

import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
const { camelize } = Ember.String;

export default Ember.Component.extend(ComponentFieldTypeMixin, {
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
    let field = this.get('field');
    let model = this.get('model');

    yield this.get('checkOfflineCache').perform();

    let id = this.get('fieldId');
    if(!Ember.isBlank(id)){
      const relationshipTypeName = ModelUtils.getParentModelTypeName(model, field);

      if(this.get('store').hasRecordForId(relationshipTypeName, id)){
        this.set('lookupValue', this.get('store').peekRecord(relationshipTypeName, id));
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
  checkOfflineCache: task(function * (){
    const store = this.get('store');
    const relationshipType = ModelUtils.getParentModelType(this.get('model'), this.get('field'), store);
    const relationshipTypeName = ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));
    // first we check if the modelType is cacheable, and if so, lets check the cache, and push them in the store if not yet done so
    if(ModelUtils.modelTypeIsCacheable(relationshipType) && !ModelUtils.modelTypeHasBeenLoadedFromCache(relationshipType)){
      // So the modelType is Cache, and hasn't already been loaded
      const localKey = camelize(`${relationshipTypeName}_store_cache`);
      const localCache = this.get('storage').get(localKey);
      if(!Ember.isBlank(localCache)) {
        // we found something locally
        store.push(localCache);
      } else {
        // nothing found locally, let's ask the server for initial data
        yield store.findAll(relationshipTypeName, {reload: true}).then((records) => {
          if(!Ember.isBlank(records) && records.get('length') > 0){
            // we found data, let's build a valid jsonapi document
            let payload = {data: []};
            var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
            records.forEach((record) => {

              let serializedRecord = record.serialize({includeId: true}).data
              serializedRecord.type = inflector.singularize(serializedRecord.type);

              payload.data.push(serializedRecord);
            });

            // and store it locally for later use
            this.get('storage').set(localKey, payload);
          }
        });
      }

      // and finally we set the cached flag
      ModelUtils.modelTypeHasBeenLoadedFromCache(relationshipType);
    }
  }),
  actions: {
    valueChanged: function(value){
      const field = this.get('field');
      const model = this.get('model');

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
