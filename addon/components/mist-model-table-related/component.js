import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';

export default Ember.Component.extend({
  tagName: null,
  modelType: Ember.computed('model', 'field', function(){
    return ModelUtils.getChildModelTypeName(this.get('model'), this.get('field'));
  }),
  parentField: Ember.computed('model', 'field', function(){
    return ModelUtils.getRelationshipInverse(this.get('model'), this.get('field'));
  }),
  filters: Ember.computed('model', 'parentField', function(){
    let filters = {};
    let parentField = this.get('parentField');

    filters[parentField] = this.get('model.id');
    return filters;
  })
});
