import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { htmlSafe } from '@ember/template';

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
    const bannerImage = this.get('user.bannerImage');

    if(!isBlank(bannerImage)) {
      return htmlSafe('cursor:pointer; background: url("'+ bannerImage.url + '"); background-size: cover;');
    }
  }),
  actions: {
    toggleProfileMenu (){
      this.set('showProfileMenu', !this.get('showProfileMenu'));
    }
  }
});
