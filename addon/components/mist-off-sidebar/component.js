import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    toggleSidebar() {
      this.sendAction('toggleSidebar');
    }
  }
});
