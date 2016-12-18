import Ember from 'ember';
import InputComponent from 'ember-field-components/mixins/component-input';

export default Ember.Component.extend(InputComponent, {
  type: 'lookup',
  noresults: 'No Results',
  activeModelType: Ember.computed('value', 'modelType', function(){
    // needed for polymorphic relationships
    if(Array.isArray(this.get('modelType'))){
      const value = this.get('value');
      if(!Ember.isBlank(value)){
        return value.constructor.modelName;
      } else {
        return this.get('modelType')[0];
      }
    } else {
      return this.get('modelType');
    }
  }),
  computedValue: Ember.computed('value', function(){
    if(Ember.isNone(this.get('value'))){
      return null;
    } else {
      return this.get('value.name');
    }
  }),
  typeaheadParams: Ember.computed(function(){
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
