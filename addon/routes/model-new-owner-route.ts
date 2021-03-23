import ModelNewRoute from '@getflights/ember-mist-components/routes/model-new-route';
import LoggedInUserService from '@getflights/ember-mist-components/services/logged-in-user';
import Model from '@ember-data/model';
import { inject as service } from '@ember/service';

export default abstract class ModelNewWithOwnerRoute extends ModelNewRoute {
  @service loggedInUser!: LoggedInUserService;

  async afterModel(model: Model) {
    // @ts-ignore
    model.set('owner', this.loggedInUser.user);
  }
}
