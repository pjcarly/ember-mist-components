import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import EntityCacheService from 'dummy/services/entity-cache';
import { inject as service } from '@ember-decorators/service';

export default abstract class ModelIndexRoute extends Route.extend(AuthenticatedRouteMixin, ScrollToTop) {
  @service entityCache !: EntityCacheService;

  afterModel() {
    super.afterModel();
    this.entityCache.clearReturnToModel();
  }
}
