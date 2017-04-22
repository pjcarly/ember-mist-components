import Ember from 'ember';
import ImageUtilities from 'ember-mist-components/classes/image';
const { htmlSafe } = Ember.String;
const { Component, inject, computed, isBlank } = Ember;

export default Component.extend({
  tagName: 'div',
  loggedInUser: inject.service(),
  session: inject.service(),
  classNameBindings: ['showProfileMenu::toggled'],
  showProfileMenu: false,
  user: computed('loggedInUser.user', function(){
    return this.get('loggedInUser.user');
  }),
  profileMenuClasses: computed('showProfileMenu', function(){
    let styleClass = 'main-menu';
    if(this.get('showProfileMenu')){
      styleClass += ' show';
    }
    return styleClass;
  }),
  profileMenuBackgroundStyle: computed('user.bannerImage', function(){
    const bannerImage = ImageUtilities.getSecureUrl(this.get('user'), 'bannerImage', this.get('session'));

    if(!isBlank(bannerImage)) {
      return htmlSafe('cursor:pointer; background: url("'+ bannerImage + '"); background-size: cover;');
    }
  }),
  actions: {
    toggleProfileMenu (){
      this.set('showProfileMenu', !this.get('showProfileMenu'));
    }
  }
});
