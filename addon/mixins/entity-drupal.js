import Ember from 'ember';
import Attribute from 'ember-field-components/classes/attribute';
import ModelAttributes from 'ember-mist-components/mixins/model-attributes';

const { Mixin } = Ember;
const { computed } = Ember;

export default Mixin.create(ModelAttributes, {
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
