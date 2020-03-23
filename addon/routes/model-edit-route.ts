import SingleModelRoute from "./single-model-route";
// @ts-ignore
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";

// @ts-ignore
export default abstract class ModelEditRoute extends SingleModelRoute.extend(
  AuthenticatedRouteMixin
) {}
