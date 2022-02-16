import ResetModelRoute from './reset-model-route';
import RecentlyViewedService from '@getflights/ember-mist-components/services/recently-viewed';
import FieldInformationService from '@getflights/ember-field-components/services/field-information';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import SessionService from 'ember-simple-auth/services/session';
import Store from "@ember-data/store";

export interface SingleModelRouteModelParams {
  id: string;
}

export default abstract class SingleModelRoute extends ResetModelRoute {
  @service fieldInformation!: FieldInformationService;
  @service recentlyViewed!: RecentlyViewedService;
  @service session!: SessionService;
  @service store!: Store;

  abstract modelName: string;
  defaultIncludes: string[] = [];
  includeLimits?: Map<string, number>;

  async beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
    return super.beforeModel(transition);
  }

  /**
   * The model hook with functionality for single entities
   * @param params The router params
   */
  async model(params: SingleModelRouteModelParams) {
    const modelDefaultIncludes = this.fieldInformation.getDefaultIncludes(
      this.modelName
    );
    const routeDefaultIncludes = this.defaultIncludes;

    // Lets merge the different includes
    let includes: string[] = [];
    if (!isBlank(modelDefaultIncludes) && modelDefaultIncludes.length > 0) {
      includes = includes.concat(modelDefaultIncludes);
    }

    if (!isBlank(routeDefaultIncludes) && routeDefaultIncludes.length > 0) {
      includes = includes.concat(routeDefaultIncludes);
    }

    // and filter the doubles
    let uniqueIncludes = includes.filter((elem, index, self) => {
      return index == self.indexOf(elem);
    });

    // And now construct the options hash
    const options: any = {};
    if (uniqueIncludes.length > 0) {
      options['include'] = uniqueIncludes.join(',');
    }

    if (this.includeLimits && this.includeLimits.size > 0) {
      if (!options.adapterOptions) {
        options['adapterOptions'] = {};
      }

      options.adapterOptions.includeLimits = {};

      this.includeLimits.forEach((limit, relationshipName) => {
        options.adapterOptions.includeLimits[relationshipName] = limit;
      });
    }

    // @ts-ignore
    return this.store.loadRecord(this.modelName, params[`id`], options);
  }

  /**
   * If an error is triggered on the transition, we remove the Model from the Recently viewed
   */
  @action
  error(error: any, transition: Transition) {
    if (!isBlank(this.modelName)) {
      if (
        transition.to &&
        transition.to.params &&
        transition.to.params.hasOwnProperty('id')
      ) {
        const id = transition.to.params.id;

        if (id) {
          this.recentlyViewed.removeRecentlyViewed(this.modelName, id);
        }
      }
    }

    if (error?.errors?.[0]?.status === '404') {
      this.transitionTo('error');
      return false;
    }

    return true;
  }
}
