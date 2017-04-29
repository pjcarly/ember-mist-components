import Ember from 'ember';
import ImageUtilities from 'ember-mist-components/classes/image';


const { Component, inject, computed, isBlank, String } = Ember;
const { htmlSafe } = String;
const { service } = inject;

export default Component.extend({
  tagName: 'div',
  loggedInUser: service(),
  session: service(),
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
