import Component from '@ember/component';

export default Component.extend({
  tagName: 'header',
  classNameBindings: ['sidebarToggled:sidebar-toggled'],
  sidebarToggled: false,
  actions: {
    toggleSidebar() {
      const toggleSidebar = this.get('toggleSidebar');
      if(toggleSidebar){
        toggleSidebar();
      }
    }
  }
});
