import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  tagName: '',

  selectOptions: Ember.computed('columns', function(){
    let store = this.get('store');
    let field = this.get('field');
    let model = this.get('model');

    let parentModelTypeName = ModelUtils.getParentModelTypeName(model, field);
    let models = store.peekAll(parentModelTypeName);

    return models;
  }),

  nameColumn: Ember.computed('field', 'model', function(){
    let field = this.get('field');
    let model = this.get('model');

    let parentModelType = ModelUtils.getParentModelType(model, field, this.get('store'));
    return ModelUtils.getNameColumn(parentModelType);
  }),

  columns: Ember.computed('field', 'model', function() {
    let columns = [];
    let field = this.get('field');
    let model = this.get('model');

    let parentModelType = ModelUtils.getParentModelType(model, field, this.get('store'));
    let columnValues = ModelUtils.getDefaultListViewColumns(parentModelType);

    columnValues.forEach(function(columnValue){
      let column = {};
      column.value = columnValue;
      column.label = ModelUtils.getLabel(parentModelType, columnValue);
      columns.push(column);
    });

    return columns;
  }),

  noresults: Ember.computed('field', 'model', function(){
    let field = this.get('field');
    let model = this.get('model');

    let parentModelType = ModelUtils.getParentModelType(model, field, this.get('store'));
    let plural = ModelUtils.getPlural(parentModelType);

    return 'No '+plural+' found';
  }),

  parentModel: Ember.computed('field', 'model', function() {
    let field = this.get('field');
    let model = this.get('model');

    return model.get(field);
  }),

  actions: {
    valueChanged: function(value){
      let field = this.get('field');
      let model = this.get('model');

      model.set(field, value);
    }
  }
});
