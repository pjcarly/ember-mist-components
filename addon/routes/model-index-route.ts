import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import EntityCacheService from 'dummy/services/entity-cache';
import { inject as service } from '@ember-decorators/service';
import Controller from '@ember/controller';
import Model from '@ember-data/model';

export default abstract class ModelIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
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

  activate() {
    super.activate();
    window.scrollTo(0,0);
  }
}
