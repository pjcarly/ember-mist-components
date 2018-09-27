import Row from 'ember-light-table/components/lt-row';
import { computed } from '@ember/object';

export default Row.extend({
  classNameBindings: ['isActivated', 'isRowSelected'],
  isActivated: computed.readOnly('row.activated'),
  isRowSelected: computed.readOnly('row.rowSelected')
});
