import Mixin from '@ember/object/mixin';
import { setType } from 'ember-field-components/classes/attribute';

export default Mixin.create({
  created: setType('datetime', {
    readOnly: true
  }),
  changed: setType('datetime', {
    readOnly: true
  })
});
