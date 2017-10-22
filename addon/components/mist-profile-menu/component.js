import Ember from 'ember';
import { getSecureUrl } from 'ember-mist-components/classes/image';

const { Component } = Ember;
const { inject } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { String } = Ember;
const { htmlSafe } = String;
const { service } = inject;

export default Component.extend({
  tagName: 'div',
  loggedInUser: service(),
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
    const bannerImage = getSecureUrl(this.get('user'), 'bannerImage');

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
