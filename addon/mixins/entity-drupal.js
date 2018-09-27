import Mixin from '@ember/object/mixin';
import Attribute from 'ember-field-components/classes/attribute';
import { computed } from '@ember/object';

export default Mixin.create({
  displayName: computed('name', function(){
    return this.get('name'); // needed for ember-aupac-typeahead
  }),
  created: Attribute.setType('datetime', {
    readOnly: true
  }),
  changed: Attribute.setType('datetime', {
    readOnly: true
  })
});
