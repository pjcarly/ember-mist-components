import Route from "@ember/routing/route";
// @ts-ignore
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import EntityCacheService from "dummy/services/entity-cache";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
// @ts-ignore
import Model from "@ember-data/model";

// @ts-ignore
export default abstract class ModelIndexRoute extends Route.extend(
  AuthenticatedRouteMixin
) {
  @service entityCache!: EntityCacheService;

  modelName!: string;
  listViewGrouping?: string;
  hideNew: boolean = false;

  afterModel() {
    super.afterModel();
    this.entityCache.clearReturnToModel();
  }

  setupController(controller: Controller, model: Model) {
    super.setupController(controller, model);
    // @ts-ignore
    controller.set("modelName", this.modelName);
    // @ts-ignore
    controller.set("listViewGrouping", this.listViewGrouping);
    // @ts-ignore
    controller.set("hideNew", this.hideNew);
  }

  activate() {
    super.activate();
    window.scrollTo(0, 0);
  }
}
