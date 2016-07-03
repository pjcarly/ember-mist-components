import Ember from 'ember';
import { getCountrySelectOptions } from 'ember-mist-components/classes/address';

export default Ember.Component.extend({
  tagName: '',
  countrySelectOptions: Ember.computed(function(){
    return getCountrySelectOptions();
  }),
  value: Ember.computed('model', 'field', function(){
    return this.get('model').get(this.get('field'));
  })
});
