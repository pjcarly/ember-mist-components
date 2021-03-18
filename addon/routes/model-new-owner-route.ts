import ModelNewRoute from '@getflights/ember-mist-components/routes/model-new-route';
import LoggedInUserService from '@getflights/ember-mist-components/services/logged-in-user';
import DrupalModel from '@getflights/ember-mist-components/models/drupal-model';
import { inject as service } from '@ember/service';

export default abstract class ModelNewWithOwnerRoute extends ModelNewRoute {
  @service loggedInUser!: LoggedInUserService;

  async afterModel(model: DrupalModel) {
    // @ts-ignore
    model.set('owner', this.loggedInUser.user);
  }
}
