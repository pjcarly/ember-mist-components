import Service from "@ember/service";
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import FieldInformationService from "ember-field-components/services/field-information";
import { inject as service } from '@ember-decorators/service';
import { assert } from "@ember/debug";
import { isBlank } from "@ember/utils";

export interface ModelListView {
  columns: string[];
  sort: ModelListViewSort;
}

export interface ModelListViewSort {
  field: string;
  dir: string;
}

export default class ListViewService extends Service {
  @service store !: Store;
  @service storage !: any;
  @service router !: any;
  @service fieldInformation !: FieldInformationService;

  /**
   * Find the List View in the store, or if not found the default list view on the model will be returned.
   *
   * @param modelName The name of the model you want a list view for
   * @param key The key of the list view (can be numeric, an id from the store, or All)
   */
  getListViewByKey(modelName: string, key : string | number) : Model | ModelListView {
    if(this.store.hasRecordForId('list-view', key)) {
      return this.store.peekRecord('list-view', key);
    }

    return this.getDefaultListView(modelName);
  }

  /**
   * Returns the default list view for the model
   * @param modelName For the model
   */
  getDefaultListView(modelName: string) : ModelListView {
    const modelClass = this.fieldInformation.getModelClass(modelName);

    assert(`No default list view defined on the modelclass ${modelName}`, modelClass.hasOwnProperty('settings') && modelClass.settings.hasOwnProperty('listViews') && modelClass.settings.listViews.hasOwnProperty('default'));
    return modelClass.settings.listViews.default;
  }

  /**
   * Returns the active list view for the current route
   */
  getActiveListViewForCurrentRoute(modelName : string) : Model | ModelListView {
    const key = this.getActiveListViewKeyForCurrentRoute(modelName);
    return this.getListViewByKey(modelName, key);
  }

  /**
   * Returns the list view that should be selected for the current route
   * @param modelName The name of the model
   */
  getActiveListViewKeyForCurrentRoute(modelName : string) : string | number {
    const currentRoute = this.router.currentRouteName;
    return this.getActiveListViewForRoute(modelName, currentRoute);
  }

  /**
   * Returns the list view that should be selected
   * @param modelName The name of the model
   * @param routeName The name of the route
   */
  getActiveListViewForRoute(modelName: string, routeName: string) : string | number {
    const listViewSelections = this.storage.get('listViewSelections');

    let selection = 'All';
    if(!isBlank(listViewSelections) && listViewSelections.hasOwnProperty(routeName) && listViewSelections[routeName].hasOwnProperty(modelName)) {
      selection = listViewSelections[routeName][modelName];
    }

    return selection;
  }

  /**
   * Sets the list view for the current route
   */
  setListViewSelectionForCurrentRoute(modelName : string, selection: number | string) : void {
    this.setListViewSelectionForRoute(modelName, selection, this.router.currentRouteName);
  }

  /**
   * Sets the list view selection and saves it in local storage
   * @param modelName The model name
   * @param selection the new selection
   * @param route the route
   */
  setListViewSelectionForRoute(modelName: string, selection: number | string, route : string) : void {
    let listViewSelections = this.storage.get('listViewSelections');

    if(isBlank(listViewSelections)){
      listViewSelections = {};
    }

    if(!listViewSelections.hasOwnProperty(route)){
      listViewSelections[route] = {};
    }

    listViewSelections[route][modelName] = selection;

    this.storage.set('listViewSelections', listViewSelections);
  }
}