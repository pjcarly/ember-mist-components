import Mixin from '@ember/object/mixin';
import Attribute from 'ember-field-components/classes/attribute';

export default Mixin.create({
  created: Attribute.setType('datetime', {
    readOnly: true
  }),
  changed: Attribute.setType('datetime', {
    readOnly: true
  })
});
