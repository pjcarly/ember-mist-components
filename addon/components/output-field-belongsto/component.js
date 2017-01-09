/* jshint noyield:true */
import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';

import OfflineModelCacheMixin from 'ember-mist-components/mixins/offline-model-cache';
import ModelUtils from 'ember-field-components/classes/model-utils';

import { task } from 'ember-concurrency';

export default Ember.Component.extend(FieldOutputComponent, OfflineModelCacheMixin, {

  store: Ember.inject.service(),
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

    if(!Ember.isBlank(fieldId)){
      if(isPolymorphic){
        // AAARGGHH private ED api, watch out!
        relationshipTypeName = model.belongsTo(field).belongsToRelationship.inverseRecord.modelName;
      }

      if(store.hasRecordForId(relationshipTypeName, fieldId)){
        this.set('lookupValue', store.peekRecord(relationshipTypeName, fieldId));
      } else {
        yield model.get(field).then((value) => {
          this.set('lookupValue', value);
        });
      }
    }
  }),
  relationshipModelType: Ember.computed('model', 'field', function(){
    if(this.get('isPolymorphic')){
      return ModelUtils.getParentModelTypeNames(this.get('model'), this.get('field'), this.get('store'));
    } else {
      return ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));
    }
  }),
  hasRoute: Ember.computed('lookupValue', function(){
    const lookupValue = this.get('lookupValue');
    if(!Ember.isBlank(lookupValue)){
      return ModelUtils.hasRoute(lookupValue.constructor);
    }
    return false;
  }),
  isPolymorphic: Ember.computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');
    return options.hasOwnProperty('polymorphic') && options.polymorphic;
  }),
  fieldId: Ember.computed('model', 'field', function(){
    return this.get('model').belongsTo(this.get('field')).id();
  }),
  route: Ember.computed('lookupValue', function(){
    const lookupValue = this.get('lookupValue');
    if(!Ember.isBlank(lookupValue)){
      return `${ModelUtils.getModelName(lookupValue)}.view`;
    }
  })
});
