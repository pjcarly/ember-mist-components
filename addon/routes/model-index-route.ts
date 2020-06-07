import Route from "@ember/routing/route";
import EntityCacheService from "ember-mist-components/services/entity-cache";
import { inject as service } from "@ember/service";
import Transition from "@ember/routing/-private/transition";
import Controller from "@ember/controller";
import Model from "@ember-data/model";
import SessionService from "ember-simple-auth/services/session";

export default abstract class ModelIndexRoute extends Route {
  @service entityCache!: EntityCacheService;
  @service session!: SessionService;

  modelName!: string;
  listViewGrouping?: string;
  hideNew: boolean = false;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, "login");
    this._super(...arguments);
  }

  afterModel() {
    // @ts-ignore
    super.afterModel(...arguments);
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
