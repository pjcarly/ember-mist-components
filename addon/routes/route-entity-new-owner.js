import EntityNewRouteMixin from 'ember-mist-components/routes/route-entity-new';

import { inject as service } from '@ember/service';

export default EntityNewRouteMixin.extend({
  loggedInUser: service(),
  afterModel(model){
    model.set('owner', this.get('loggedInUser.user'));
  }
});
