// @ts-ignore
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";

export function authenticatedRoute(desc: any) {
  if (typeof desc === "function") {
    desc.reopen(AuthenticatedRouteMixin);
  } else {
    return {
      ...desc,
      finisher(target: any) {
        target.reopen(AuthenticatedRouteMixin);

        return target;
      }
    };
  }
}
