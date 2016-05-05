import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  loggedInUser: Ember.inject.service(),
  classNameBindings: ['showProfileMenu::toggled'],
  showProfileMenu: false,
  user: Ember.computed('loggedInUser.user', function(){
    return this.get('loggedInUser.user');
  }),
  profileMenuClasses: Ember.computed('showProfileMenu', function(){
    let styleClass = 'main-menu';
    if(this.get('showProfileMenu')){
      styleClass += ' show';
    }
    return styleClass;
  }),
  actions: {
    toggleProfileMenu: function(){
      this.set('showProfileMenu', !this.get('showProfileMenu'));
    }
  }
});
