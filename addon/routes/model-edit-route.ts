import Route from "@ember/routing/route";
import Transition from "@ember/routing/-private/transition";
import { inject as service } from "@ember/service";
import SessionService from "ember-simple-auth/services/session";

export default class ModelEditRoute extends Route {
  @service session!: SessionService;

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, "login");
    this._super(...arguments);
  }
}
