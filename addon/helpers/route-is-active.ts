import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";
import RouterService from "@ember/routing/router-service";

export default class RouteIsActiveHelper extends Helper {
  @service router!: RouterService;

  compute(
    [route]: [string],
    { activeWhen }: { activeWhen: string; value: string }
  ): boolean {
    return (
      this.router.currentRouteName === route ||
      this.router.currentRouteName === activeWhen
    );
  }
}
