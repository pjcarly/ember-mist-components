import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, ScrollToTop, {
  entityCache: service(),
  afterModel(){
    this.get('entityCache').clearReturnToModel();
  }
});
