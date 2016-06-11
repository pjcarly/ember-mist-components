import Body from 'ember-light-table/components/lt-body';
import callAction from 'ember-light-table/utils/call-action';

export default Body.extend({
  actions: {
    onRowMouseEnter(row) {
      callAction(this, 'onRowMouseEnter', ...arguments);
    },
    onRowMouseLeave(row) {
      callAction(this, 'onRowMouseLeave', ...arguments);
    }
  }
});
