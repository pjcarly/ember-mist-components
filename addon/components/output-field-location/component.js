import Ember from 'ember';
import InputFieldLocation from 'ember-mist-components/components/input-field-location/component';

export default InputFieldLocation.extend({
  key: Ember.computed(function(){
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    return config.googleMap.apiKey;
  })
});
