import Ember from 'ember';
import InputFieldLocation from 'ember-mist-components/components/input-field-location/component';

const { computed, getOwner } = Ember;

export default InputFieldLocation.extend({
  key: computed(function(){
    let config = getOwner(this).resolveRegistration('config:environment');
    return config.googleMap.apiKey;
  })
});
