import Ember from 'ember';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';

export default Ember.Component.extend(FieldInputComponent, {
  computedValue: Ember.computed('value', function(){
    const value = this.get('value');
    return `YY${value}`;
  })
});
