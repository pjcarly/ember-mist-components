import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import EntityCacheService from 'dummy/services/entity-cache';
import { inject as service } from '@ember-decorators/service';
import Controller from '@ember/controller';
import Model from '@ember-data/model';

export default abstract class ModelIndexRoute extends Route.extend(AuthenticatedRouteMixin, ScrollToTop) {
  @service entityCache !: EntityCacheService;

  modelName !: string;
  listViewGrouping ?: string;
  hideNew : boolean = false;

  afterModel() {
    super.afterModel();
    this.entityCache.clearReturnToModel();
  }

  setupController(controller: Controller, model: Model) {
    super.setupController(controller, model);
    controller.set('modelName', this.modelName);
    controller.set('listViewGrouping', this.listViewGrouping);
    controller.set('hideNew', this.hideNew);
  }
}
