import Body from 'ember-light-table/components/lt-body';

export default Body.extend({
  actions: {
    onRowMouseEnter(/*row*/) {
      this.sendAction('onRowMouseEnter', ...arguments);
    },
    onRowMouseLeave(/*row*/) {
      this.sendAction('onRowMouseLeave', ...arguments);
    }
  }
});
