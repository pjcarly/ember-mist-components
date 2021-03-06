import Helper from "@ember/component/helper";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { inject as service } from "@ember/service";
import EntityRouterService from "@getflights/ember-mist-components/services/entity-router";

export default class ArrayJoinHelper extends Helper {
  @service entityRouter!: EntityRouterService;

  compute([model, route]: [DrupalModel, string]) {
    return () => {
      this.entityRouter.transitionToModelRoute(model, route);
    };
  }
}
