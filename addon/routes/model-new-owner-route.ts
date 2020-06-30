import ModelNewRoute from "ember-mist-components/routes/model-new-route";
import LoggedInUserService from "ember-mist-components/services/logged-in-user";
import DrupalModel from "ember-mist-components/models/drupal-model";
import { inject as service } from "@ember/service";

export default abstract class ModelNewWithOwnerRoute extends ModelNewRoute {
  @service loggedInUser!: LoggedInUserService;

  afterModel(model: DrupalModel) {
    // @ts-ignore
    model.set("owner", this.loggedInUser.user);
  }
}
