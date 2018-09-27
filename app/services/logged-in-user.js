import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { Promise } from 'rsvp';

export default Service.extend({
  session: service('session'),
  store: service(),
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
