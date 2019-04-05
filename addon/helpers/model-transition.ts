import Helper from '@ember/component/helper';
import DrupalModel from 'ember-mist-components/models/drupal-model';
import { inject as service } from '@ember-decorators/service';
import EntityRouterService from 'dummy/services/entity-router';

export default class ArrayJoinHelper extends Helper {
  @service entityRouter !: EntityRouterService;

  compute([model, route] : [DrupalModel, string]) {
    return () => {
      this.entityRouter.transitionToModelRoute(model, route);
    }
  }
}