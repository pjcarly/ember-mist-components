import Component from '@ember/component';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import Table from 'ember-light-table';
import Query from 'ember-mist-components/query/Query';
import FieldInformationService from 'ember-field-components/services/field-information';
import ListViewService, { ModelListView } from 'ember-mist-components/services/list-view';
import SelectOption from 'ember-field-components/addon/interfaces/SelectOption';
import Order, { Direction } from 'ember-mist-components/query/Order';
import { inject as service } from '@ember-decorators/service';
import { tagName } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { isArray } from '@ember/array';
import { dropTask, task } from 'ember-concurrency-decorators';
import { guidFor } from '@ember/object/internals';
import { A } from '@ember/array';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { camelize, dasherize } from '@ember/string';
import { isBlank } from '@ember/utils';
import { assert } from '@ember/debug';

export interface Column {
  label ?: string;
  modelType ?: string;
  valuePath ?: string;
  transitionToModel ?: boolean;
  width ?: string | undefined;
  resizable ?: boolean;
  cellComponent ?: string;
  cellClassNames ?: string;
  component ?: string;
  classNames ?: string;
  sorted ?: boolean;
  ascending ?: boolean;
  selectAll ?: boolean;
}

@tagName('')
export default class ModelTableComponent extends Component {
  @service store !: Store;
  @service intl !: any;
  @service router !: any;
  @service fieldInformation !: FieldInformationService;
  @service listView !: ListViewService;

  /**
   * The ember-light-table instance
   */
  table : Table = new Table([]);
  lastPage : number = 0;
  resultRowFirst : number = 0;
  resultRowLast : number = 0;
  resultTotalCount : number = 0;
  selectedModels : any = A();
  modelName !: string | string[];
  activeModelName !: string;
  title ?: string;
  multiselect : boolean = false;
  listViewKey : string = '';

  /**
   * A flag that can be passed in to indicate whether to display the list views as tabs or as a select list
   */
  listViewsAsTabs : boolean = false;

  /**
   * The default class the wrapper will get
   */
  class : string = 'model-table';

  /**
   * The flag to indicate whether the amount of selected models in the table should be displayed
   */
  displaySelected : boolean = false;

  /**
   * Closure actions
   */
  onRowSelected?: (selectedRow: any) => void;
  onRowMouseEnter?: (selectedRow: any) => void;
  onRowMouseLeave?: (selectedRow: any) => void;


  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.setActiveModelType();
    this.initializeTable.perform();
  }

  @task
  * initializeTable() {
    yield this.fetchRecords.perform();

    if(this.searchFixed) {
      this.set('searchVisible', true);
      this.focusSearch();
    }
  }

  /**
   * Indicates whether the search bar on top of the table should always be visible
   */
  searchFixed : boolean = false;

  /**
   * Indicates whether the search bar should be visible or not
   */
  searchVisible : boolean = false;

  /**
   * Returns a Query instance based on the active model name.
   */
  @computed('activeModelName')
  get query() : Query {
    const query = Query.create({
      modelName: this.activeModelName
    });

    query.setLimit(10);
    return query;
  }

  /**
   * Returns true if there are multiple modelnames passed (for example with polymorphic relationships)
   */
  @computed('modelName')
  get isMultiModelNames() : boolean {
    return isArray(this.modelName);
  }

  /**
   * The inputId that will be used for the search input element
   */
  @computed
  get searchInputId() : string {
    return `${this.guid}-search`;
  }

  /**
   * Checks whether multiselect should be enabled on this table
   */
  @computed('multiselect')
  get isMultiSelect() : boolean {
    return this.multiselect === true;
  }

  /**
   * Returns the config for this application
   */
  @computed
  get config() : any {
    return getOwner(this).resolveRegistration('config:environment');
  }

  /**
   * Returns the bootstrap version defined in the config, depending on this value the colums will be rendered differently
   */
  @computed('config')
  get bootstrapVersion() : number | undefined {
    const config = this.config;
    if(config.hasOwnProperty('ember-mist-components') && config['ember-mist-components'].hasOwnProperty('bootstrapVersion')) {
      return config['ember-mist-components'].bootstrapVersion;
    }

    return;
  }

  @computed('title', 'activeModelName')
  get titleComputed() : string {
    if(this.title) {
      return this.title;
    } else {
      return this.fieldInformation.getTranslatedPlural(this.activeModelName);
    }
  }

  /**
   * This will return the key of the current selected list view value
   */
  @computed('router.currentRouteName', 'activeModelName', 'listViewKey')
  get selectedListView() : Model | ModelListView {
    return this.listView.getActiveListViewForCurrentRoute(this.activeModelName);
  }

  /**
   * This will return the columns that need to be displayed in the table (based on the list view)
   */
  @computed('activeModelName', 'selectedListView', 'intl.locale')
  get columns() : Column[] {
    // This function gets the columns defined on the model, and sets them as the columns of the table
    const columns = [];

    if(this.isMultiSelect) {
      const column : Column = {
        label: '',
        width: '60px',
        resizable: false,
        cellComponent: 'mist-model-table-selector',
        cellClassNames: 'selector',
        component: 'mist-model-table-all-selector',
        classNames: 'selector',
        selectAll: true
      };

      columns.push(column);
    }

    // here we loop over every column in the listview, ans format it for ember light table
    get(<any> this.selectedListView, 'columns').forEach((modelColumn: any) => {
      // First we split the columns by a ".", this is so we dont loose the dot when camelizing, as it indicates a value path
      // This only has effect for subobjects, like location, and address
      const splittedColumns = modelColumn.toString().split('.');
      splittedColumns.forEach((splittedColumn: string, index: number) => {
        splittedColumns[index] = camelize(splittedColumn);
      });

      // We handled the ".", and now we can rejoin the column
      const camelizedColumn = splittedColumns.join('.');
      const sortedOnColumn = (this.query.orders.length > 0 && this.query.orders[0].field === dasherize(modelColumn));


      // And finally build the structure for ember-light-table
      const column : Column = {
        label: this.fieldInformation.getTranslatedFieldlabel(this.activeModelName, camelizedColumn),
        modelType: this.activeModelName,
        valuePath: camelizedColumn,
        transitionToModel: (!this.onRowSelected && !this.isMultiSelect), // When no row selected action or multiselect is provided, we will route to the model being displaye
        width: (modelColumn === 'id') ? '60px' : undefined,
        resizable: (modelColumn !== 'id'),
        cellComponent: 'mist-model-table-cell',
        sorted: sortedOnColumn,
        ascending: (sortedOnColumn && this.query.orders[0].direction  === Direction.ASC)
      };

      columns.push(column);
    });

    return columns;
  }

  @computed('selectedModels.[]')
  get amountSelected() : number {
    return this.selectedModels.length;
  }

  /**
   * Returns a unique id for this component
   */
  @computed
  get guid() : string {
    return guidFor(this);
  }

  @computed('modelName', 'intl.locale')
  get modelNameSelectOptions() : SelectOption[] {
    const modelNames = <string[]> this.modelName;
    const selectOptions : SelectOption[] = [];

    modelNames.forEach((modelName: string) => {
      const plural = this.fieldInformation.getTranslatedPlural(modelName);

      const selectOption : SelectOption = {
        value: modelName,
        label: plural
      };

      selectOptions.push(selectOption);
    });

    return selectOptions;
  }

  /**
   * Returns true if the list view edit links should be displayed
   */
  @computed('config')
  get displayListViewLinks() : boolean {
    const config = this.get('config');
    if(config.hasOwnProperty('ember-mist-components') && config['ember-mist-components'].hasOwnProperty('displayListViewLinks')) {
      return config['ember-mist-components'].displayListViewLinks;
    }

    return false;
  }

  /**
   * Sets the activated state of all rows to false.
   * The activated state is the indication which row is 'active' (for example the one you are hovering, or the one your are navigating on with the keyboard)
   */
  deactivateRows(){
    this.table.get('rows').setEach('activated', false);
  }

  /**
   * Initializes the activeModelName, this is an alias of modelName when only 1 is passed, in case multiple are passed the first one is used
   */
  setActiveModelType() : void {
    if(!this.activeModelName) {
      if(this.isMultiModelNames){
        this.set('activeModelName', this.modelName[0]);
      } else {
        this.set('activeModelName', this.modelName);
      }
    }
  }

  /**
   * Focusses the search input element
   */
  focusSearch() {
    const domElement = document.getElementById(this.searchInputId);
    if(domElement) {
      domElement.focus();
    }
  }

  /**
   * This function makes sure, that when we change limits, pages, refresh, ...
   * we set the selected attribute to the correct rows
   */
  reSetSelected() {
    if(this.isMultiSelect) {

      for(const row of this.table.get('rows')) {
        const model : Model = row.get('content');
        row.set('rowSelected', this.selectedModels.includes(model));
      }

      this.setSelectAllColumn();
    }
  }

  /**
   * Sets the colums on the table based on the active list view
   */
  setColumns() {
    this.table.setColumns(this.columns);
  }

  /**
   * Activates the previous row
   */
  activatePreviousRow() {
    const rows : any = this.table.get('rows');

    let activatedIndex : number | undefined;
    rows.forEach((row : any, index : number) => {
      if(row.get('activated')){
        activatedIndex = index;
      }
    });

    if(!activatedIndex){
      rows[0].set('activated', true);
    } else if(activatedIndex > 0){
      rows.setEach('activated', false);
      rows[activatedIndex-1].set('activated', true);
    }
  }

  /**
   * Activate the next row in the table
   */
  activateNextRow() {
    const rows = this.table.get('rows');
    let activatedIndex : number | undefined;
    rows.forEach((row : any, index : number) => {
      if(row.get('activated')){
        activatedIndex = index;
      }
    });

    if(!activatedIndex){
      rows[0].set('activated', true);
    } else if(activatedIndex+1 < rows.length){
      rows.setEach('activated', false);
      rows[activatedIndex+1].set('activated', true);
    }
  }

  /**
   * This function will set the select all boolean, based on the selected rows
   */
  setSelectAllColumn(){
    const selectAllColumn = this.table.columns.get('firstObject');
    selectAllColumn.set('valuePath', this.table.get('rows').isEvery('rowSelected', true));

    if(this.selectedModels.get('length') === 0 && this.displaySelected) {
      this.toggleProperty('displaySelected');
      this.fetchRecords.perform();
    }
  }

  /**
   * Sets the Query Parameters from the selected list view
   */
  setQueryParamsBasedOnActiveListView(){
    assert(`Listview not found`, !isBlank(this.selectedListView));
    const listViewLimit = get(this.selectedListView, 'rows');
    const listViewSort = get(this.selectedListView, 'sortOrder');

    this.query.setLimit(isBlank(listViewLimit) ? 10 : listViewLimit);

    if(!isBlank(listViewSort)) {
      this.query.clearOrders();
      this.query.addOrder(new Order(listViewSort.field, listViewSort.dir && listViewSort.dir.toLowerCase() == 'desc' ? Direction.DESC : Direction.ASC));
    }
  }

  /**
   * Fetches the records from the back-end
   */
  @dropTask
  * fetchRecords() {
    // Lets check if a listview is selected. And pass if to the query if needed
    const activeListViewKey = this.listView.getActiveListViewKeyForCurrentRoute(this.activeModelName);

    if(activeListViewKey !== 'All') {
      this.query.setListView(<number> activeListViewKey);
    } else {
      this.query.clearListView();
    }

    // Now we can query the store
    yield this.query.fetch(this.store).then(records => {
      this.table.setRows(records);

      const meta = records.get('meta');
      this.query.setPage(isBlank(meta['page-current']) ? 1 : meta['page-current']);
      this.set('lastPage', isBlank(meta['page-count']) ? 1 : meta['page-count']);
      this.set('resultRowFirst', isBlank(meta['result-row-first']) ? 0 : meta['result-row-first']);
      this.set('resultRowLast', isBlank(meta['result-row-last']) ? 0 : meta['result-row-last']);
      this.set('resultTotalCount', isBlank(meta['total-count']) ? 0 : meta['total-count']);
      this.reSetSelected();
    });

    // If no colums are found, lets also set them
    if(isBlank(this.table.get('columns'))){
      this.setColumns();
    }
  }

  @dropTask
  * fetchRecordsAndRefreshColumns() {
    yield this.get('fetchRecords').perform();
    // Needed for polymorphic tables
    this.setColumns();
  }

  /**
   * This function sets the search string on the query, and resets the page
   * @param value The search string
   */
  @action
  searchValueChanged(value : string) {
    this.query.setPage(1);
    this.query.setSearch(value);
  }

  /**
   * Toggles the Search bar, if it was invisible, it'll become visible and focused
   * If it was visible, it will be hidden and the search term in the query will be removed
   */
  @action
  toggleSearch() {
    if(!this.searchFixed){
      this.toggleProperty('searchVisible');

      if(this.searchVisible) {
        this.focusSearch();
      } else {
        // when we toggle the search, and there is a search value filled in, we clear the value and refresh the records
        this.query.clearSearch();
        this.fetchRecords.perform();
      }
    }
  }

  /**
   * Executes the search or displays the search innput, depending on if the search was visible or not
   */
  @action
  search(){
    if(this.searchVisible) {
      this.fetchRecords.perform();
    } else {
      this.toggleSearch();
    }
  }

  /**
   * Performs a new fetch and refreshes the displayed records
   */
  @action
  refresh() {
    this.fetchRecords.perform();
  }

  /**
   * Goes to the next page in the table and performs a fetch for the new records
   */
  @action
  nextPage(){
    if(this.query.page < this.lastPage) {
      this.query.nextPage();
      this.fetchRecords.perform();
    }
  }

  /**
   * Goes to the previous page and performs a fetch
   */
  @action
  prevPage(){
    if(this.query.page > 1) {
      this.query.prevPage();
      this.fetchRecords.perform();
    }
  }

  /**
   * Jumps to a specific page and refreshes the records
   * @param page The page number to jump to
   */
  @action
  pageSelected(page : number) {
    this.query.setPage(page);
    this.fetchRecords.perform();
  }

  /**
   * Changes the amount of results to display in the table
   * @param limit The new limit
   */
  @action
  limitChanged(limit : number) {
    this.query.setPage(1);
    this.query.setLimit(limit);
    this.fetchRecords.perform();
  }

  /**
   * Depending on where the click happens either sorting will take place, or all rows will be selected in case of multiselect and selectAll column
   * @param column The column that was clicked
   */
  @action
  onColumnClick(column : any) {
    if(this.isMultiSelect && column.get('selectAll')){
      column.set('sorted', false);
      column.toggleProperty('valuePath');

      for(const row of this.table.get('rows')) {
        row.set('rowSelected', column.get('valuePath'));
        const model : Model = row.get('content');

        if(row.get('rowSelected')){
          if(!this.selectedModels.includes(model)){
            // model not yet in the array, so we add it
            this.selectedModels.pushObject(model);
          }
        } else {
          if(this.selectedModels.includes(model)){
            // model in the array, while it shouldn't be, remove it
            this.selectedModels.removeObject(model);
          }
        }
      }
    } else if (column.sorted) {
      this.query.clearOrders();
      this.query.addOrder(new Order(dasherize(column.get('valuePath')), column.ascending ? Direction.ASC : Direction.DESC));
      this.query.setPage(1);

      this.fetchRecords.perform();
    }
  }

  /**
   * What must happen when a row was clicked in the table
   *  - In case an action was passed in, we delegate the selected row to the action
   *  - In case multi select is enabled and no action was passed, we select the row
   * @param selectedRow The row that was selected
   */
  @action
  rowSelected(selectedRow : any){
    if(!this.onRowSelected) {
      if(this.isMultiSelect) {
        selectedRow.toggleProperty('rowSelected');

        const selectedModels = this.get('selectedModels');
        const model = selectedRow.get('content');

        if(selectedRow.get('rowSelected')) {
          if(!selectedModels.includes(model)) {
            // model not yet in the array, so we add it
            selectedModels.pushObject(model);
          }
        } else {
          if(selectedModels.includes(model)) {
            // model in the array, while it shouldn't be, remove it
            selectedModels.removeObject(model);
          }
        }

        if(this.displaySelected) {
          this.fetchRecords.perform();
        } else {
          this.setSelectAllColumn();
        }
      }
    } else {
      if(this.onRowSelected){
        this.onRowSelected(selectedRow);
      }
    }
  }

  /**
   * Deactivate other rows
   * @param row The row which is being hovered
   */
  @action
  rowMouseEnter(row : any) {
    this.deactivateRows();
    if(this.onRowMouseEnter) {
      this.onRowMouseEnter(row);
    }
  }

  @action
  rowMouseLeave(row : any) {
    this.deactivateRows();
    if(this.onRowMouseLeave) {
      this.onRowMouseLeave(row);
    }
  }

  @action
  toggleDisplaySelected() {
    this.query.setPage(1);
    this.toggleProperty('displaySelected');
    this.fetchRecords.perform();
  }

  @action
  activeModelNameChanged(activeModelName: string) {
    this.set('activeModelName', activeModelName);

    // We trigger the property change for the list view key, this way the list views will be reloaded
    this.notifyPropertyChange('listViewKey');

    // Now we can refetch the records and reset the columns
    this.fetchRecordsAndRefreshColumns.perform();
  }

  @action
  listViewChanged(_: string) {
    this.notifyPropertyChange('listViewKey');
    this.setQueryParamsBasedOnActiveListView();
    this.fetchRecordsAndRefreshColumns.perform();
  }
}
