import Ember from 'ember';
import OutputComponent from 'ember-field-components/mixins/component-output';

export default Ember.Component.extend(OutputComponent, {
  type: 'lookup',
  computedValue: Ember.computed('value', 'nameColumn', function(){
    if(Ember.isNone(this.get('value'))){
      return null;
    } else {
      return this.get('value.'+this.get('nameColumn'));
    }
  })
});
