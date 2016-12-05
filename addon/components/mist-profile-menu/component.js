import Ember from 'ember';
import ImageUtilities from 'ember-mist-components/classes/image';

export default Ember.Component.extend({
  tagName: 'div',
  loggedInUser: Ember.inject.service(),
  session: Ember.inject.service(),
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
    const bannerImage = ImageUtilities.getSecureUrl(this.get('user'), 'bannerImage', this.get('session'));

    if(!Ember.isBlank(bannerImage)) {
      return Ember.String.htmlSafe('cursor:pointer; background: url("'+ bannerImage + '"); background-size: cover;');
    }
  }),
  actions: {
    toggleProfileMenu (){
      this.set('showProfileMenu', !this.get('showProfileMenu'));
    }
  }
});
