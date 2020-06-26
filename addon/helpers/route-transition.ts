import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";
import RouterService from "@ember/routing/router-service";

export default class RouteTransitionHelper extends Helper {
  @service router!: RouterService;

  compute([route]: [string]) {
    return () => {
      this.router.transitionTo(route);
    };
  }
}
