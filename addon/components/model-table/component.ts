import Component from "@ember/component";
import Store from "ember-data/store";
import Model from "ember-data/model";
import Query from "@getflights/ember-mist-components/query/Query";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import ListViewService, {
  ModelListView,
} from "@getflights/ember-mist-components/services/list-view";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import Order, {
  Direction,
} from "@getflights/ember-mist-components/query/Order";
import { inject as service } from "@ember/service";
import { tagName } from "@ember-decorators/component";
import { computed, action } from "@ember/object";
import { isArray } from "@ember/array";
import NativeArray from "@ember/array/mutable";
import { task, restartableTask } from "ember-concurrency-decorators";
import { guidFor } from "@ember/object/internals";
import { A } from "@ember/array";
import { get } from "@ember/object";
import { camelize, dasherize } from "@ember/string";
import { isBlank } from "@ember/utils";
import { assert } from "@ember/debug";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import { taskFor } from "ember-concurrency-ts";
import { tracked } from "@glimmer/tracking";
import { getOwner, setOwner } from "@ember/application";

export interface ModelClassInterface {
  fields: Map<string, string>;
  eachComputedProperty: any;
}

export class Table {
  rows = A<Row>();
  columns = A<Column>();

  setRows(models: NativeArray<Model>) {
    this.rows.clear();

    models.forEach((model) => {
      const row = new Row();
      setOwner(row, getOwner(this));

      row.content = model;
      row.rowSelected = false;
      row.activated = false;
      this.rows.pushObject(row);
    });
  }
}

export class Column {
  label?: string;
  modelName?: string;
  @tracked valuePath?: string | boolean;
  transitionToModel?: boolean;
  width?: string;
  resizable?: boolean;
  cellComponent?: string;
  cellClassNames?: string;
  component?: string;
  classNames?: string;
  @tracked sorted?: boolean;
  @tracked ascending?: boolean;
  selectAll?: boolean;
}

export class Row {
  content!: Model;
  @tracked rowSelected!: boolean;
  @tracked activated!: boolean; // this boolean is used when the row is active, for example when it is hovered, or when it is the active row in a navigation with the keyboard
}

@tagName("")
export default class ModelTableComponent extends Component {
  @service store!: Store;
  @service intl!: any;
  @service router!: any;
  @service fieldInformation!: FieldInformationService;
  @service listView!: ListViewService;

  table!: Table;
  lastPage: number = 0;
  resultRowFirst: number = 0;
  resultRowLast: number = 0;
  resultTotalCount: number = 0;
  selectedModels: any = A();
  modelName!: string | string[];
  activeModelName!: string;
  title?: string;
  multiselect: boolean = false;
  listViewKey: string = "";
  listViewGrouping?: string;
  modelListView?: string;
  baseQuery?: Query;

  /**
   * A flag that can be passed in to indicate whether to display the list views as tabs or as a select list
   */
  listViewsAsTabs: boolean = false;
  tabPosition: "bottom" | "top" = "bottom";

  /**
   * The flag to indicate whether the amount of selected models in the table should be displayed
   */
  displaySelected: boolean = false;

  /**
   * Closure actions
   */
  onRowSelected?: (selectedRow: any) => void;
  onRowMouseEnter?: (selectedRow: any) => void;
  onRowMouseLeave?: (selectedRow: any) => void;

  didReceiveAttrs() {
    this.set("table", new Table());
    setOwner(this.table, getOwner(this));

    super.didReceiveAttrs();
    this.setActiveModelName();
    this.setQueryParamsBasedOnActiveListView();
    taskFor(this.initializeTable).perform();
  }

  @task
  *initializeTable() {
    yield taskFor(this.fetchRecords).perform();

    if (this.searchFixed) {
      this.set("searchVisible", true);
      this.focusSearch();
    }
  }

  /**
   * Indicates whether the search bar on top of the table should always be visible
   */
  searchFixed: boolean = false;

  /**
   * Indicates whether the search bar should be visible or not
   */
  searchVisible: boolean = false;

  /**
   * Returns a Query instance based on the active model name.
   */
  @computed("activeModelName", "baseQuery")
  get query(): Query {
    const query = Query.create({
      modelName: this.activeModelName,
    });

    if (this.baseQuery) {
      query.copyFrom(this.baseQuery);
      query.setModelName(this.activeModelName);
    }

    query.setLimit(10);
    return query;
  }

  /**
   * Returns true if there are multiple modelnames passed (for example with polymorphic relationships)
   */
  @computed("modelName")
  get isMultiModelNames(): boolean {
    return isArray(this.modelName);
  }

  /**
   * The inputId that will be used for the search input element
   */
  @computed()
  get searchInputId(): string {
    return `${this.guid}-search`;
  }

  /**
   * Checks whether multiselect should be enabled on this table
   */
  @computed("multiselect")
  get isMultiSelect(): boolean {
    return this.multiselect === true;
  }

  /**
   * Returns the config for this application
   */
  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  /**
   * Returns the bootstrap version defined in the config, depending on this value the colums will be rendered differently
   */
  @computed("config")
  get bootstrapVersion(): number | undefined {
    const config = this.config;
    if (
      config.hasOwnProperty("ember-mist-components") &&
      config["ember-mist-components"].hasOwnProperty("bootstrapVersion")
    ) {
      return config["ember-mist-components"].bootstrapVersion;
    }

    return;
  }

  @computed("title", "activeModelName")
  get titleComputed(): string {
    if (this.title) {
      return this.title;
    } else {
      return this.fieldInformation.getTranslatedPlural(this.activeModelName);
    }
  }

  /**
   * This will return the key of the current selected list view value
   */
  @computed(
    "router.currentRouteName",
    "activeModelName",
    "listViewKey",
    "modelListView",
    "listViewGrouping"
  )
  get selectedListView(): ListViewModel | ModelListView {
    if (this.listViewGrouping) {
      return this.listView.getActiveListViewForCurrentRoute(
        this.activeModelName
      );
    } else if (this.modelListView) {
      return this.listView.getModelListView(
        this.activeModelName,
        this.modelListView
      );
    }

    return this.listView.getDefaultListView(this.activeModelName);
  }

  @computed("activeModelName")
  get activeModelClass(): ModelClassInterface {
    return this.store.modelFor(this.activeModelName);
  }

  @computed("activeModelName")
  get allActiveModelClassColums(): Map<string, any> {
    const returnValue = new Map<string, any>();

    this.activeModelClass.eachComputedProperty(
      (field: string, options: any) => {
        returnValue.set(field, options);
      }
    );

    return returnValue;
  }

  /**
   * This will return the columns that need to be displayed in the table (based on the list view)
   */
  @computed("activeModelName", "selectedListView", "intl.locale")
  get columns(): NativeArray<Column> {
    // This function gets the columns defined on the model, and sets them as the columns of the table
    const columns = A<Column>();

    if (this.isMultiSelect) {
      const column = new Column();
      setOwner(column, getOwner(this));

      column.label = "";
      column.width = "60px";
      column.resizable = false;
      column.cellComponent = "model-table-selector";
      column.cellClassNames = "selector";
      column.component = "model-table-all-selector";
      column.classNames = "selector";
      column.selectAll = true;

      columns.pushObject(column);
    }

    // here we loop over every column in the listview, ans format it for ember light table
    let listViewColumns: string[] = [];
    if (this.selectedListView instanceof Model) {
      this.selectedListView
        .hasMany("columns")
        .ids()
        .forEach((fieldId) => {
          const fieldArray = fieldId.toString().split(".");
          fieldArray.shift();
          listViewColumns.push(fieldArray.join("."));
        });
    } else {
      listViewColumns = this.selectedListView.columns;
    }

    listViewColumns.forEach((modelColumn: any) => {
      // First we split the columns by a ".", this is so we dont loose the dot when camelizing, as it indicates a value path
      // This only has effect for subobjects, like location, and address
      const splittedColumns = modelColumn.toString().split(".");
      splittedColumns.forEach((splittedColumn: string, index: number) => {
        splittedColumns[index] = camelize(splittedColumn);
      });

      // We handled the ".", and now we can rejoin the column
      const camelizedColumn = splittedColumns.join(".");
      const sortedOnColumn =
        this.query.orders.length > 0 &&
        this.query.orders[0].field === dasherize(modelColumn);

      // Now that we know the column, lets see if it actually exists as a field on the modelclass
      if (this.allActiveModelClassColums.has(camelizedColumn)) {
        // And finally build the structure for the table
        const column = new Column();
        setOwner(column, getOwner(this));

        column.label = this.fieldInformation.getTranslatedFieldlabel(
          this.activeModelName,
          camelizedColumn
        );

        column.modelName = this.activeModelName;
        column.valuePath = camelizedColumn;
        column.transitionToModel = !this.onRowSelected && !this.isMultiSelect; // When no row selected action or multiselect is provided, we will route to the model being displayed
        column.width = modelColumn === "id" ? "60px" : undefined;
        column.resizable = modelColumn !== "id";
        column.cellComponent = "model-table-cell";
        column.sorted = sortedOnColumn;
        column.ascending =
          sortedOnColumn && this.query.orders[0].direction === Direction.ASC;

        columns.push(column);
      }
    });

    return columns;
  }

  @computed("selectedModels.[]")
  get amountSelected(): number {
    return this.selectedModels.length;
  }

  /**
   * Returns a unique id for this component
   */
  @computed()
  get guid(): string {
    return guidFor(this);
  }

  @computed("modelName", "intl.locale")
  get modelNameSelectOptions(): SelectOption[] {
    const modelNames = <string[]>this.modelName;
    const selectOptions: SelectOption[] = [];

    modelNames.forEach((modelName: string) => {
      const plural = this.fieldInformation.getTranslatedPlural(modelName);

      const selectOption: SelectOption = {
        value: modelName,
        label: plural,
      };

      selectOptions.push(selectOption);
    });

    return selectOptions;
  }

  get activeListViewKey(): string | number {
    return this.listView.getActiveListViewKeyForCurrentRoute(
      this.activeModelName
    );
  }

  /**
   * Returns true if the list view edit links should be displayed
   */
  @computed("config")
  get displayListViewLinks(): boolean {
    const config = this.config;
    if (
      config.hasOwnProperty("ember-mist-components") &&
      config["ember-mist-components"].hasOwnProperty("displayListViewLinks")
    ) {
      return config["ember-mist-components"].displayListViewLinks;
    }

    return false;
  }

  /**
   * Sets the activated state of all rows to false.
   * The activated state is the indication which row is 'active' (for example the one you are hovering, or the one your are navigating on with the keyboard)
   */
  deactivateRows() {
    this.table.rows.setEach("activated", false);
  }

  /**
   * Initializes the activeModelName, this is an alias of modelName when only 1 is passed, in case multiple are passed the first one is used
   */
  setActiveModelName(): void {
    if (!this.activeModelName) {
      if (this.isMultiModelNames) {
        this.set("activeModelName", this.modelName[0]);
      } else {
        this.set("activeModelName", this.modelName);
      }
    }
  }

  /**
   * Focusses the search input element
   */
  focusSearch() {
    const domElement = document.getElementById(this.searchInputId);
    if (domElement) {
      domElement.focus();
    }
  }

  /**
   * This function makes sure, that when we change limits, pages, refresh, ...
   * we set the selected attribute to the correct rows
   */
  reSetSelected() {
    if (this.isMultiSelect) {
      this.table.rows.forEach((row) => {
        row.rowSelected = this.selectedModels.includes(row.content);
      });

      this.setSelectAllColumn();
    }
  }

  /**
   * Sets the colums on the table based on the active list view
   */
  setColumns() {
    this.table.columns.clear();
    this.table.columns.pushObjects(this.columns);
  }

  /**
   * This function will set the select all boolean, based on the selected rows
   */
  setSelectAllColumn() {
    const selectAllColumn = this.table.columns.firstObject;

    if (selectAllColumn) {
      selectAllColumn.valuePath = this.table.rows.isEvery("rowSelected", true);

      if (this.selectedModels.length === 0 && this.displaySelected) {
        this.toggleProperty("displaySelected");
        taskFor(this.fetchRecords).perform();
      }
    }
  }

  /**
   * Sets the Query Parameters from the selected list view
   */
  setQueryParamsBasedOnActiveListView() {
    assert(`Listview not found`, !isBlank(this.selectedListView));

    const listViewSort = get(this.selectedListView, "sortOrder");

    this.query.setLimit(this.selectedListView.rows ?? 10);

    if (this.selectedListView.sortOrder) {
      this.query.clearOrders();
      this.query.addOrder(
        new Order(
          listViewSort.field,
          listViewSort.dir && listViewSort.dir.toLowerCase() == "desc"
            ? Direction.DESC
            : Direction.ASC
        )
      );
    }
  }

  /**
   * Fetches the records from the back-end
   */
  @restartableTask
  *fetchRecords() {
    // Lets check if a listview is selected. And pass if to the query if needed
    if (this.activeListViewKey !== "All") {
      this.query.setListView(<number>this.activeListViewKey);
    } else {
      this.query.clearListView();
    }

    // Now we can query the store
    yield this.query.fetch(this.store).then((records: NativeArray<Model>) => {
      this.table.setRows(records);

      // @ts-ignore: The ember-data types do not expose a Array type of a query result, with meta data from the query result in
      const meta = records.get("meta");
      this.query.setPage(meta["page-current"] ?? 1);
      this.set("lastPage", meta["page-count"] ?? 1);
      this.set("resultRowFirst", meta["result-row-first"] ?? 0);
      this.set("resultRowLast", meta["result-row-last"] ?? 0);
      this.set("resultTotalCount", meta["total-count"] ?? 0);

      this.reSetSelected();
    });

    // If no colums are found, lets also set them
    if (this.table.columns.length === 0) {
      this.setColumns();
    }
  }

  @restartableTask
  *fetchRecordsAndRefreshColumns() {
    yield taskFor(this.fetchRecords).perform();
    // Needed for polymorphic tables
    this.setColumns();
  }

  /**
   * This function sets the search string on the query, and resets the page
   * @param value The search string
   */
  @action
  searchValueChanged(value: string) {
    this.query.setPage(1);
    this.query.setSearch(value);
  }

  /**
   * Toggles the Search bar, if it was invisible, it'll become visible and focused
   * If it was visible, it will be hidden and the search term in the query will be removed
   */
  @action
  toggleSearch() {
    if (!this.searchFixed) {
      this.toggleProperty("searchVisible");

      if (this.searchVisible) {
        this.focusSearch();
      } else {
        // when we toggle the search, and there is a search value filled in, we clear the value and refresh the records
        this.query.clearSearch();
        taskFor(this.fetchRecords).perform();
      }
    }
  }

  /**
   * Executes the search or displays the search innput, depending on if the search was visible or not
   */
  @action
  search() {
    if (this.searchVisible) {
      taskFor(this.fetchRecords).perform();
    } else {
      this.toggleSearch();
    }
  }

  /**
   * Performs a new fetch and refreshes the displayed records
   */
  @action
  refresh() {
    taskFor(this.fetchRecords).perform();
  }

  /**
   * Goes to the next page in the table and performs a fetch for the new records
   */
  @action
  nextPage() {
    if (this.query.page < this.lastPage) {
      this.query.nextPage();
      taskFor(this.fetchRecords).perform();
    }
  }

  /**
   * Goes to the previous page and performs a fetch
   */
  @action
  prevPage() {
    if (this.query.page > 1) {
      this.query.prevPage();
      taskFor(this.fetchRecords).perform();
    }
  }

  /**
   * Jumps to a specific page and refreshes the records
   * @param page The page number to jump to
   */
  @action
  pageSelected(page: number) {
    this.query.setPage(page);
    taskFor(this.fetchRecords).perform();
  }

  /**
   * Changes the amount of results to display in the table
   * @param limit The new limit
   */
  @action
  limitChanged(limit: number) {
    this.query.setPage(1);
    this.query.setLimit(limit);
    taskFor(this.fetchRecords).perform();
  }

  /**
   * Depending on where the click happens either sorting will take place, or all rows will be selected in case of multiselect and selectAll column
   * @param column The column that was clicked
   */
  @action
  onColumnClick(column: Column) {
    if (this.isMultiSelect && column.selectAll) {
      column.sorted = false;
      column.valuePath = !column.valuePath;

      this.table.rows.forEach((row) => {
        row.rowSelected = <boolean>column.valuePath;

        if (row.rowSelected) {
          if (!this.selectedModels.includes(row.content)) {
            // model not yet in the array, so we add it
            this.selectedModels.pushObject(row.content);
          }
        } else {
          if (this.selectedModels.includes(row.content)) {
            // model in the array, while it shouldn't be, remove it
            this.selectedModels.removeObject(row.content);
          }
        }
      });
    } else {
      this.table.columns.setEach("sorted", false);
      column.sorted = true;
      column.ascending = !column.ascending;

      this.query.clearOrders();
      this.query.addOrder(
        new Order(
          dasherize(<string>column.valuePath),
          column.ascending ? Direction.ASC : Direction.DESC
        )
      );
      this.query.setPage(1);
      taskFor(this.fetchRecords).perform();
    }
  }

  /**
   * What must happen when a row was clicked in the table
   *  - In case an action was passed in, we delegate the selected row to the action
   *  - In case multi select is enabled and no action was passed, we select the row
   * @param selectedRow The row that was selected
   */
  @action
  rowSelected(selectedRow: any) {
    if (!this.onRowSelected) {
      if (this.isMultiSelect) {
        selectedRow.toggleProperty("rowSelected");
        const model = selectedRow.get("content");

        if (selectedRow.get("rowSelected")) {
          if (!this.selectedModels.includes(model)) {
            // model not yet in the array, so we add it
            this.selectedModels.pushObject(model);
          }
        } else {
          if (this.selectedModels.includes(model)) {
            // model in the array, while it shouldn't be, remove it
            this.selectedModels.removeObject(model);
          }
        }

        if (this.displaySelected) {
          taskFor(this.fetchRecords).perform();
        } else {
          this.setSelectAllColumn();
        }
      }
    } else {
      if (this.onRowSelected) {
        this.onRowSelected(selectedRow);
      }
    }
  }

  /**
   * Deactivate other rows
   * @param row The row which is being hovered
   */
  @action
  rowMouseEnter(event: Event) {
    this.deactivateRows();
    if (this.onRowMouseEnter) {
      this.onRowMouseEnter(event);
    }
  }

  @action
  rowMouseLeave(event: Event) {
    this.deactivateRows();
    if (this.onRowMouseLeave) {
      this.onRowMouseLeave(event);
    }
  }

  @action
  toggleDisplaySelected() {
    this.query.setPage(1);
    this.toggleProperty("displaySelected");
    taskFor(this.fetchRecords).perform();
  }

  @action
  activeModelNameChanged(activeModelName: string) {
    this.set("activeModelName", activeModelName);

    // We trigger the property change for the list view key, this way the list views will be reloaded
    this.notifyPropertyChange("listViewKey");

    // Now we can refetch the records and reset the columns
    taskFor(this.fetchRecordsAndRefreshColumns).perform();
  }

  @action
  listViewChanged(_: string) {
    this.notifyPropertyChange("listViewKey");
    this.setQueryParamsBasedOnActiveListView();
    taskFor(this.fetchRecordsAndRefreshColumns).perform();
  }
}
