import Ember from 'ember';
import Attribute from 'ember-field-components/classes/attribute';

const { Mixin } = Ember;
const { computed } = Ember;

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
