import Component from '@ember/component';

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
