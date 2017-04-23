import Ember from 'ember';

const { Service, inject, computed, isBlank } = Ember;
const { Promise } = Ember.RSVP;

export default Service.extend({
  session: inject.service('session'),
  store: inject.service(),
  user: null,
  isAuthenticated: computed.oneWay('session.isAuthenticated', function() {
    return this.get('session.isAuthenticated');
  }),
  loadCurrentUser() {
    return new Promise((resolve, reject) => {
      const userId = this.get('session.data.authenticated.user_id');
      if (!isBlank(userId)) {
        return this.get('store').find('user', userId).then((user) => {
          this.set('user', user);
          resolve();
        }, reject);
      } else {
        resolve();
      }
    });
  },
  logOut(){
    this.set('user', null);
    this.get('session').invalidate();
  }
});
