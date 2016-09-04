import Row from 'ember-light-table/components/lt-row';

export default Row.extend({
  classNameBindings: ['isActivated', 'isRowSelected'],
  isActivated: Ember.computed.readOnly('row.activated'),
  isRowSelected: Ember.computed.readOnly('row.rowSelected')
});
