import Ember from 'ember';
import Row from 'ember-light-table/components/lt-row';

const { computed } = Ember;

export default Row.extend({
  classNameBindings: ['isActivated', 'isRowSelected'],
  isActivated: computed.readOnly('row.activated'),
  isRowSelected: computed.readOnly('row.rowSelected')
});
