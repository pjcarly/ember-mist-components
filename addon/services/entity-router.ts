import Service from '@ember/service';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import { getModelName } from 'ember-field-components/classes/model-utils';
import { inject as service } from '@ember-decorators/service';

interface RouterService {
  transitionTo(route: string, id?: string) : void;
}

export default class EntityRouterService extends Service {
  @service store!: Store;
  @service router!: RouterService;

  /**
   * @param model Transition to the view route for the provided model
   */
  transitionToView(model: Model){
    this.transitionToModelRoute(model, 'view');
  }

  /**
   * @param model Transition to the edit route for the provided model
   */
  transitionToEdit(model: Model){
    this.transitionToModelRoute(model, 'edit');
  }

  /**
   * @param model Transition to the delete route for the provided model
   */
  transitionToDelete(model: Model){
    this.transitionToModelRoute(model, 'delete');
  }

  /**
   * @param modelName The modelname to transition to the create route
   */
  transitionToCreate(modelName: string){
    this.router.transitionTo(`${modelName}.new`);
  }

  /**
   * @param modelName The modelname to transition to the index route
   */
  transitionToList(modelName: string){
    this.router.transitionTo(`${modelName}`);
  }

  /**
   * Transition to a modelroute
   * @param model The model to get the modelroute from
   * @param route The route within the model route to navigate to
   */
  transitionToModelRoute(model: Model, route: string) {
    const modelName = getModelName(model);
    this.router.transitionTo(`${modelName}.${route}`, model.get('id'));
  }
};
