import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';

const { Route, inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, SingleEntityRouteMixin, ScrollToTop, {
  entityCache: service(),
  afterModel(){
    this.get('entityCache').clearReturnToModel();
  }
});
