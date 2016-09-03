import Row from 'ember-light-table/components/lt-row';

export default Row.extend({
  classNameBindings: ['isActivated'],
  isActivated: Ember.computed.readOnly('row.activated')
});
