import Transition from "@ember/routing/-private/transition";
import { inject as service } from "@ember/service";
import SessionService from "ember-simple-auth/services/session";
import SingleModelRoute from "./single-model-route";

export default class ModelEditRoute extends SingleModelRoute {
  @service session!: SessionService;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, "login");
    this._super(...arguments);
  }
}
