import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'header',
  classNameBindings: ['sidebarToggled:sidebar-toggled'],
  sidebarToggled: false,
  actions: {
    toggleSidebar() {
      this.sendAction('toggleSidebar');
    }
  }
});
