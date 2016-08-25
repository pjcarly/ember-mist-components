import Ember from 'ember';
import InputComponent from 'ember-field-components/mixins/component-input';

export default Ember.Component.extend(InputComponent, {
  type: 'lookup',
  hasInputButton: true,

  selectOptions: [],
  columns: [],
  nameColumn: null,
  noresults: 'No Results',

  computedValue: Ember.computed('value', 'nameColumn', function(){
    if(Ember.isNone(this.get('value'))){
      return null;
    } else {
      return this.get('value.'+this.get('nameColumn'));
    }
  }),

  hasValue: Ember.computed('value', function(){
    return !Ember.isNone(this.get('value'));
  }),

  actions: {
    showModal: function() {
      this.$('.modal').modal('show');
    },
    objectSelected: function(selectedObject) {
      this.$('.modal').modal('hide');
      this.set('value', selectedObject);
      this.sendAction('valueChanged', selectedObject);
    },
    clearLookup: function() {
      this.set('value', null);
      this.sendAction('valueChanged', null);
    }
  }
});
