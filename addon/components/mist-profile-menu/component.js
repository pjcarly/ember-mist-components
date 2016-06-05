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
  profileMenuBackgroundStyle: Ember.computed('user.bannerImage', function(){
    const bannerImage = this.get('user.bannerImage');

    if(!Ember.isBlank(bannerImage)) {
      return Ember.String.htmlSafe('cursor:pointer; background: url("'+ bannerImage.url + '"); background-size: cover;');
    }
  }),
  actions: {
    toggleProfileMenu (){
      this.set('showProfileMenu', !this.get('showProfileMenu'));
    }
  }
});
