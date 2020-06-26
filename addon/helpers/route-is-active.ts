import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";
import RouterService from "@ember/routing/router-service";

export default class RouteIsActiveHelper extends Helper {
  @service router!: RouterService;

  compute([route]: [string], { activeWhen }: { activeWhen?: string }): boolean {
    const rootRoute = this.getRootRoute(route);
    const activeRootNode = this.getRootRoute(this.router.currentRouteName);

    return (
      rootRoute === activeRootNode ||
      (activeWhen !== undefined &&
        activeWhen !== null &&
        activeWhen.split(" ").some((possibleActiveRoute) => {
          return this.getRootRoute(possibleActiveRoute) === activeRootNode;
        }))
    );
  }

  getRootRoute(route: string): string {
    return route.split(".")[0];
  }
}
