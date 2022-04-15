import Service from '@ember/service';
import Store from '@ember-data/store';
import FieldInformationService from '@getflights/ember-field-components/services/field-information';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';
import type RouterService from '@ember/routing/router-service';
import StorageService from '@getflights/ember-mist-components/services/storage';

// A ModelListview is an object that can be defined as a static POJO on the Model itself
export interface ListViewInterface {
  rows?: number;
  columns: string[];
  sortOrder?: {
    field: string;
    dir: 'ASC' | 'DESC';
  };
}

export default class ListViewService extends Service {
  @service store!: Store;
  @service storage!: StorageService;
  @service router!: RouterService;
  @service fieldInformation!: FieldInformationService;

  /**
   * Find the List View in the store, or if not found the default list view on the model will be returned.
   *
   * @param modelName The name of the model you want a list view for
   * @param key The key of the list view (can be numeric, an id from the store, or All)
   */
  getListViewByKey(modelName: string, key: string | number): ListViewInterface {
    if (this.store.hasRecordForId('list-view', key)) {
      const listViewModel = <ListViewInterface>(
        this.store.peekRecord('list-view', key)
      );
      return this.transformListViewModelToInterface(listViewModel);
    }

    return this.getDefaultListView(modelName);
  }

  /**
   * Transforms the given list view model, to an POJO following the ListViewInterface
   * @param model The model you wish to transform
   */
  transformListViewModelToInterface(model: ListViewInterface): ListViewInterface {
    const returnValue: ListViewInterface = {
      columns: [],
    };

    returnValue.rows = model.rows;
    model
      // @ts-ignore
      .hasMany('columns')
      .ids()
      .forEach((fieldId: string) => {
        const fieldArray = fieldId.toString().split('.');
        fieldArray.shift();
        returnValue.columns.push(fieldArray.join('.'));
      });

    returnValue.sortOrder = model.sortOrder;
    return returnValue;
  }

  /**
   * Returns the default list view for the model
   * @param modelName For the model
   */
  getDefaultListView(modelName: string): ListViewInterface {
    return this.getModelListView(modelName, 'default');
  }

  /**
   * Returns a  model list view by name
   * @param modelName For the model
   */
  getModelListView(modelName: string, listViewName: string): ListViewInterface {
    const modelClass = this.fieldInformation.getModelClass(modelName);

    assert(
      `No list view (${listViewName}) defined on the modelclass ${modelName}`,
      modelClass.hasOwnProperty('settings') &&
      modelClass.settings.hasOwnProperty('listViews') &&
      modelClass.settings.listViews.hasOwnProperty(listViewName)
    );
    return modelClass.settings.listViews[listViewName];
  }

  /**
   * Returns the active list view for the current route
   */
  getActiveListViewForCurrentRoute(modelName: string): ListViewInterface {
    const key = this.getActiveListViewKeyForCurrentRoute(modelName);
    return this.getListViewByKey(modelName, key);
  }

  /**
   * Returns the list view that should be selected for the current route
   * @param modelName The name of the model
   */
  getActiveListViewKeyForCurrentRoute(modelName: string): string | number {
    const currentRoute = this.router.currentRouteName;
    return this.getActiveListViewForRoute(modelName, currentRoute);
  }

  /**
   * Returns the list view that should be selected
   * @param modelName The name of the model
   * @param routeName The name of the route
   */
  getActiveListViewForRoute(
    modelName: string,
    routeName: string
  ): string | number {
    const listViewSelections = this.storage.retrieve('listViewSelections');

    let selection = 'All';
    if (
      !isBlank(listViewSelections) &&
      listViewSelections.hasOwnProperty(routeName) &&
      listViewSelections[routeName].hasOwnProperty(modelName)
    ) {
      selection = listViewSelections[routeName][modelName];
    }

    return selection;
  }

  /**
   * Sets the list view for the current route
   */
  setListViewSelectionForCurrentRoute(
    modelName: string,
    selection: number | string
  ): void {
    this.setListViewSelectionForRoute(
      modelName,
      selection,
      this.router.currentRouteName
    );
  }

  /**
   * Sets the list view selection and saves it in local storage
   * @param modelName The model name
   * @param selection the new selection
   * @param route the route
   */
  setListViewSelectionForRoute(
    modelName: string,
    selection: number | string,
    route: string
  ): void {
    let listViewSelections = this.storage.retrieve('listViewSelections');

    if (isBlank(listViewSelections)) {
      listViewSelections = {};
    }

    if (!listViewSelections.hasOwnProperty(route)) {
      listViewSelections[route] = {};
    }

    listViewSelections[route][modelName] = selection;

    this.storage.persist('listViewSelections', listViewSelections);
  }
}
