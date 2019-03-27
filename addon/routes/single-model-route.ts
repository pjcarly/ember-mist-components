import ResetModelRoute from "./reset-model-route";
import RecentlyViewedService from "dummy/services/recently-viewed";
import FieldInformationService from "ember-field-components/app/services/field-information";
import { inject as service } from "@ember-decorators/service";
import { isBlank } from "@ember/utils";
import { action } from "@ember-decorators/object";

export interface SingleModelRouteModelParams {
  id: string;
}

export default class SingleModelRoute extends ResetModelRoute {
  @service fieldInformation !: FieldInformationService;
  @service recentlyViewed !: RecentlyViewedService;

  modelName !: string;
  defaultIncludes : string[] = [];

  /**
   * The model hook with functionality for single entities
   * @param params The router params
   */
  model(params : SingleModelRouteModelParams) {
    const modelDefaultIncludes = this.fieldInformation.getDefaultIncludes(this.modelName);
    const routeDefaultIncludes = this.defaultIncludes;

    // Lets merge the different includes
    let includes : string[] = [];
    if(!isBlank(modelDefaultIncludes) && modelDefaultIncludes.length > 0) {
      includes = includes.concat(modelDefaultIncludes);
    }

    if(!isBlank(routeDefaultIncludes) && routeDefaultIncludes.length > 0) {
      includes = includes.concat(routeDefaultIncludes);
    }

    // and filter the doubles
    let uniqueIncludes = includes.filter((elem, index, self) => {
      return index == self.indexOf(elem);
    })

    // And now construct the options hash
    const options : any = {};
    if(uniqueIncludes.length > 0) {
      options['include'] = uniqueIncludes.join(',');
    }

    return this.store.loadRecord(this.modelName, params[`id`], options);
  }

  /**
   * If an error is triggered on the transition, we remove the Model from the Recently viewed
   */
  @action
  error(_ : any, transition: any) {
    if(!isBlank(this.modelName)) {
      const routeName = transition.targetName;

      if(transition.params.hasOwnProperty(routeName) && transition.params[routeName].hasOwnProperty(`id`)) {
        const id = transition.params[routeName][`id`];
        if(!isBlank(id)) {
          this.recentlyViewed.removeRecentlyViewed(this.modelName, id);
        }
      }
    }

    return true;
  }
}
