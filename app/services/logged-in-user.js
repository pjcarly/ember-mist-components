import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default Service.extend({
  session: service(),
  store: service(),
  isAuthenticated: computed.oneWay('session.isAuthenticated', function() {
    return this.get('session.isAuthenticated');
  }),
  loadCurrentUser() {
    const userId = this.get('session.data.authenticated.user_id');

    if(!isBlank(userId)){
      return this.get('store').loadRecord('user', userId)
      .then((user) => {
        this.set('user', user);
        return user;
      });
    }
  },
  logOut(){
    this.set('user', null);
    this.get('session').invalidate();
  }
});
