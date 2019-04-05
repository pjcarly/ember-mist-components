import InputFieldLocation from 'ember-mist-components/components/input-field-location/component';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';

export default InputFieldLocation.extend({
  key: computed(function() {
    let config = getOwner(this).resolveRegistration('config:environment');
    return config.googleMap.apiKey;
  })
});
