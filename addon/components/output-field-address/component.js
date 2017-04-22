import Ember from 'ember';
import { getCountrySelectOptions } from 'ember-mist-components/classes/address';
const { Component, computed } = Ember;

export default Component.extend({
  tagName: '',
  countrySelectOptions: computed(function(){
    return getCountrySelectOptions();
  }),
  value: computed('model', 'field', function(){
    return this.get('model').get(this.get('field'));
  })
});
