import Ember from 'ember';
import EntityNewRouteMixin from 'ember-mist-components/routes/route-entity-new';

const { inject } = Ember;
const { service } = inject;

export default EntityNewRouteMixin.extend({
  loggedInUser: service(),
  afterModel(model){
    model.set('owner', this.get('loggedInUser.user'));
  }
});
