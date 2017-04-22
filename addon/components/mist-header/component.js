import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  tagName: 'header',
  classNameBindings: ['sidebarToggled:sidebar-toggled'],
  sidebarToggled: false,
  actions: {
    toggleSidebar() {
      this.sendAction('toggleSidebar');
    }
  }
});
