import Component from '@ember/component';

export default Component.extend({
  actions: {
    toggleSidebar() {
      const toggleSidebar = this.get('toggleSidebar');
      if(toggleSidebar){
        toggleSidebar();
      }
    }
  }
});
