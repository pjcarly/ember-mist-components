import Route from "@ember/routing/route";
import EntityCacheService from "@getflights/ember-mist-components/services/entity-cache";
import { inject as service } from "@ember/service";
import Transition from "@ember/routing/-private/transition";
import Controller from "@ember/controller";
import Model from "@ember-data/model";
import SessionService from "ember-simple-auth/services/session";

export default abstract class ModelIndexRoute extends Route {
  @service entityCache!: EntityCacheService;
  @service session!: SessionService;

  abstract modelName: string;
  listViewGrouping?: string;
  hideNew: boolean = false;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, "login");
    // @ts-ignore
    super.beforeModel(...arguments);
  }

  afterModel(_model: Model, _transition: Transition) {
    // @ts-ignore
    super.afterModel(...arguments);
    this.entityCache.clearReturnToModel();
  }

  // @ts-ignore
  setupController(
    controller: Controller,
    model: Model,
    transition: Transition
  ) {
    // @ts-ignore
    super.setupController(controller, model, transition);
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
