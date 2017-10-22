import Ember from 'ember';
import InputComponent from 'ember-field-components/mixins/component-input';
import { getModelType, getPlural } from 'ember-field-components/classes/model-utils';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Component.extend(InputComponent, {
  type: 'lookup',
  noresults: 'No Results',
  store: service(),
  activeModelType: computed('value', 'modelType', function(){
    // needed for polymorphic relationships
    if(Array.isArray(this.get('modelType'))){
      const value = this.get('value');
      if(!isBlank(value)){
        return value.constructor.modelName;
      } else {
        return this.get('modelType')[0];
      }
    } else {
      return this.get('modelType');
    }
  }),
  modelTitle: computed('activeModelType', function(){
    const activeModelTypeName = this.get('activeModelType');
    if(!isBlank(activeModelTypeName)) {
      const modelType = getModelType(activeModelTypeName, this.get('store'));
      return getPlural(modelType);
    } else {
      return 'Models';
    }
  }),
  computedValue: computed('value', function(){
    if(isBlank(this.get('value'))){
      return null;
    } else {
      return this.get('value.name');
    }
  }),
  typeaheadParams: computed(function(){
    return { filter: { name: { operator: 'STARTS_WITH' } } };
  }),
  actions: {
    showModal() {
      this.$('.modal').modal('show');
      this.set('modalVisible', true);
    },
    closeModal(){
      this.$('.modal').modal('hide');
      this.set('modalVisible', false);
    },
    clearLookup() {
      this.set('value', null);
      this.sendAction('valueChanged', null);
    },
    rowSelected(row){
      this.send('closeModal');
      this.sendAction('valueChanged', row.get('content'));
    },
    typeaheadSelected(model){
      this.sendAction('valueChanged', model);
    }
  }
});
