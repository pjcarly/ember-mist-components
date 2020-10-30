import Component from "@glimmer/component";
import Store from "@ember-data/store";
import Model from "@ember-data/model";
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
import { computed, action } from "@ember/object";
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
import { getOwner } from "@ember/application";
import { later } from "@ember/runloop";

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

      row.content = model;
      row.selected = false;
      row.activated = false;
      this.rows.pushObject(row);
    });
  }
}

export class Column {
  @tracked sorted?: boolean;
  @tracked ascending?: boolean;
  @tracked valuePath?: string | boolean;
  label?: string;
  modelName!: string | string[];
  transitionToModel?: boolean;
  cellComponent?: string;
  selectAll?: boolean;
}

export class Row {
  @tracked selected!: boolean;
  @tracked activated!: boolean; // this boolean is used when the row is active, for example when it is hovered, or when it is the active row in a navigation with the keyboard
  content!: Model;
}

export interface Arguments {
  modelName: string | string[];
  title?: string;
  multiselect?: boolean;
  listViewGrouping?: string; // The list view grouping string
  modelListView?: string; // The static list view defined on the model
  searchFixed?: boolean; // whether or not to display the search field fixed
  listViewsAsTabs?: boolean;
  baseQuery?: Query;
  tabPosition?: "bottom" | "top";
  selectedModels?: NativeArray<Model>;
  onSelectionChanged?: (selection: NativeArray<Model>) => void;
  onRowSelected?: (selectedRow: Row) => void;
  onRowMouseEnter?: (selectedRow: Row) => void;
  onRowMouseLeave?: (selectedRow: Row) => void;
}

export default class ModelTableComponent extends Component<Arguments> {
  @service store!: Store;
  @service intl!: any;
  @service router!: any;
  @service fieldInformation!: FieldInformationService;
  @service listView!: ListViewService;

  @tracked activeModelName!: string;
  @tracked searchVisible: boolean = false;
  @tracked lastPage: number = 0;
  @tracked resultRowFirst: number = 0;
  @tracked resultRowLast: number = 0;
  @tracked resultTotalCount: number = 0;
  @tracked listViewKey: string = "";

  table = new Table();
  guid!: string;
  selectedModels = A<Model>();

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    this.guid = guidFor(this);

    if (args.selectedModels) {
      this.selectedModels.addObjects(args.selectedModels);
    }

    this.setActiveModelName();
    this.setQueryParamsBasedOnActiveListView();
    taskFor(this.initializeTable).perform();
  }

  @task
  async initializeTable() {
    await taskFor(this.fetchRecords).perform();

    if (this.args.searchFixed) {
      this.searchVisible = true;
      this.focusSearch();
    }
  }

  /**
   * Returns a Query instance based on the active model name.
   */
  @computed("activeModelName", "args.baseQuery")
  get query(): Query {
    const query = new Query(this.activeModelName);

    if (this.args.baseQuery) {
      query.copyFrom(this.args.baseQuery);
      query.setModelName(this.activeModelName);

      if (!this.args.baseQuery.hasLimit()) {
        query.setLimit(10);
      }
    } else {
      query.setLimit(10);
    }

    return query;
  }

  /**
   * The inputId that will be used for the search input element
   */
  get searchInputId(): string {
    return `${this.guid}-search`;
  }

  /**
   * Returns the config for this application
   */
  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  get titleComputed(): string {
    if (this.args.title) {
      return this.args.title;
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
    "args.modelListView",
    "args.listViewGrouping"
  )
  get selectedListView(): ListViewModel | ModelListView {
    if (this.args.listViewGrouping) {
      return this.listView.getActiveListViewForCurrentRoute(
        this.activeModelName
      );
    } else if (this.args.modelListView) {
      return this.listView.getModelListView(
        this.activeModelName,
        this.args.modelListView
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

    if (this.args.multiselect) {
      const column = new Column();
      column.label = "";
      column.cellComponent = "model-table-selector";
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
        this.query.getOrders().length > 0 &&
        this.query.getOrders()[0].field === dasherize(modelColumn);

      // Now that we know the column, lets see if it actually exists as a field on the modelclass
      if (this.allActiveModelClassColums.has(camelizedColumn)) {
        // And finally build the structure for the table
        const column = new Column();

        column.label = this.fieldInformation.getTranslatedFieldlabel(
          this.activeModelName,
          camelizedColumn
        );

        column.modelName = this.activeModelName;
        column.valuePath = camelizedColumn;
        column.transitionToModel =
          !this.args.onRowSelected && !this.args.multiselect; // When no row selected action or multiselect is provided, we will route to the model being displayed
        column.cellComponent = "model-table-cell";
        column.sorted = sortedOnColumn;
        column.ascending =
          sortedOnColumn &&
          this.query.getOrders()[0].direction === Direction.ASC;

        columns.push(column);
      }
    });

    return columns;
  }

  @computed("modelName", "intl.locale")
  get modelNameSelectOptions(): SelectOption[] {
    const selectOptions: SelectOption[] = [];

    const pushSelectOptionForModelName = (modelName: string): void => {
      const plural = this.fieldInformation.getTranslatedPlural(modelName);

      const selectOption: SelectOption = {
        value: modelName,
        label: plural,
      };

      selectOptions.push(selectOption);
    };

    if (Array.isArray(this.args.modelName)) {
      this.args.modelName.forEach((modelName: string) => {
        pushSelectOptionForModelName(modelName);
      });
    } else {
      pushSelectOptionForModelName(this.args.modelName);
    }

    return selectOptions;
  }

  get activeListViewKey(): string | number {
    return this.listView.getActiveListViewKeyForCurrentRoute(
      this.activeModelName
    );
  }

  get isMultiModelNames(): boolean {
    return Array.isArray(this.args.modelName);
  }

  /**
   * Returns true if the list view edit links should be displayed
   */
  @computed()
  get displayListViewLinks(): boolean {
    return (
      this.config?.["ember-mist-components"]?.displayListViewLinks ?? false
    );
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
      if (Array.isArray(this.args.modelName)) {
        this.activeModelName = this.args.modelName[0];
      } else {
        this.activeModelName = this.args.modelName;
      }
    }
  }

  /**
   * Focusses the search input element
   */
  focusSearch() {
    const domElement = document.getElementById(this.searchInputId);
    if (domElement) {
      later(
        domElement,
        function () {
          domElement.focus();
        },
        250
      );
    }
  }

  /**
   * This function makes sure, that when we change limits, pages, refresh, ...
   * we set the selected attribute to the correct rows
   */
  reSetSelected() {
    if (this.args.multiselect) {
      this.table.rows.forEach((row) => {
        row.selected = this.selectedModels.includes(row.content);
      });
    }
  }

  /**
   * Sets the colums on the table based on the active list view
   */
  setColumns() {
    this.table.columns.clear();
    this.table.columns.pushObjects(this.columns);
  }

  @computed("fetchRecords.isRunning", "table.rows.@each.selected")
  get allRowsSelected(): boolean {
    return (
      !(
        // @ts-ignore
        this.fetchRecords.isRunning
      ) && this.table.rows.isEvery("selected", true)
    );
  }

  /**
   * Sets the Query Parameters from the selected list view
   */
  setQueryParamsBasedOnActiveListView() {
    assert(`Listview not found`, !isBlank(this.selectedListView));

    const listViewSort = get(this.selectedListView, "sortOrder");

    this.query.setLimit(
      this.selectedListView.rows ?? this.args.baseQuery?.getLimit() ?? 10
    );

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
  async fetchRecords() {
    // Lets check if a listview is selected. And pass if to the query if needed
    if (this.activeListViewKey !== "All") {
      this.query.setListView(<number>this.activeListViewKey);
    } else {
      this.query.clearListView();
    }

    // Now we can query the store
    await this.query.fetch(this.store).then((records: NativeArray<Model>) => {
      this.table.setRows(records);

      // @ts-ignore: The ember-data types do not expose a Array type of a query result, with meta data from the query result in
      const meta = records.get("meta");
      this.query.setPage(meta["page-current"] ?? 1);
      this.lastPage = meta["page-count"] ?? 1;
      this.resultRowFirst = meta["result-row-first"] ?? 0;
      this.resultRowLast = meta["result-row-last"] ?? 0;
      this.resultTotalCount = meta["total-count"] ?? 0;

      this.reSetSelected();
    });

    // If no colums are found, lets also set them
    if (this.table.columns.length === 0) {
      this.setColumns();
    }
  }

  @restartableTask
  async fetchRecordsAndRefreshColumns() {
    await taskFor(this.fetchRecords).perform();
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
    if (!this.args.searchFixed) {
      this.searchVisible = !this.searchVisible;

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
  search(event: Event) {
    if (this.searchVisible) {
      taskFor(this.fetchRecords).perform();
    }

    event.preventDefault();
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
    if (this.query.getCurrentPage() < this.lastPage) {
      this.query.nextPage();
      taskFor(this.fetchRecords).perform();
    }
  }

  /**
   * Goes to the previous page and performs a fetch
   */
  @action
  prevPage() {
    if (this.query.getCurrentPage() > 1) {
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
    if (this.args.multiselect && column.selectAll) {
      column.sorted = false;
      column.valuePath = !column.valuePath;

      this.table.rows.forEach((row) => {
        row.selected = <boolean>column.valuePath;

        if (row.selected) {
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

      if (this.args.onSelectionChanged) {
        this.args.onSelectionChanged(this.selectedModels);
      }
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
  rowSelected(selectedRow: Row) {
    if (this.args.multiselect) {
      selectedRow.selected = !selectedRow.selected;
      const model = selectedRow.content;

      if (selectedRow.selected) {
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

      if (this.args.onSelectionChanged) {
        this.args.onSelectionChanged(this.selectedModels);
      }
    }

    if (this.args.onRowSelected) {
      this.args.onRowSelected(selectedRow);
    }
  }

  /**
   * Deactivate other rows
   * @param row The row which is being hovered
   */
  @action
  rowMouseEnter(row: Row) {
    this.deactivateRows();
    if (this.args.onRowMouseEnter) {
      this.args.onRowMouseEnter(row);
    }
  }

  @action
  rowMouseLeave(row: Row) {
    this.deactivateRows();
    if (this.args.onRowMouseLeave) {
      this.args.onRowMouseLeave(row);
    }
  }

  @action
  activeModelNameChanged(activeModelName: string) {
    this.activeModelName = activeModelName;
    // Now we can refetch the records and reset the columns
    taskFor(this.fetchRecordsAndRefreshColumns).perform();
  }

  @action
  listViewChanged(_: string) {
    this.setQueryParamsBasedOnActiveListView();
    taskFor(this.fetchRecordsAndRefreshColumns).perform();
  }
}
