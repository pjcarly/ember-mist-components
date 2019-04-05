import Body from 'ember-light-table/components/lt-body';

export default Body.extend({
  actions: {
    onRowMouseEnter(/*row*/) {
      const onRowMouseEnter = this.get('onRowMouseEnter');
      if(onRowMouseEnter) {
        onRowMouseEnter(...arguments);
      }
    },
    onRowMouseLeave(/*row*/) {
      const onRowMouseLeave = this.get('onRowMouseLeave');
      if(onRowMouseLeave) {
        onRowMouseLeave(...arguments);
      }
    }
  }
});
