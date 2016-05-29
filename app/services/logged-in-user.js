import Ember from 'ember';

export default Ember.Service.extend({
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),
  user: null,
  isAuthenticated: Ember.computed.oneWay('session.isAuthenticated', function() {
    return this.get('session.isAuthenticated');
  }),
  loadCurrentUser() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const userId = this.get('session.data.authenticated.user_id');
      if (!Ember.isEmpty(userId)) {
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
