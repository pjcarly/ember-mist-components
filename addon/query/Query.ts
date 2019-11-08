import Store from "ember-data/store";
import Condition, { QueryFilter, Operator } from "./Condition";
import Order from "./Order";
import EmberObject from "@ember/object";

export interface QueryParams {
  page?: number;
  include?: string;
  sort?: string;
  limit?: number;
  filter?: { [key: string]: QueryFilter | number | string };
  _single?: boolean;
}

export default class Query extends EmberObject {
  modelName!: string; // The type of model you want to query
  conditions: Condition[] = []; // The conditions of the query
  conditionLogic?: string; // The condition logic you want to use for the condtions. Defaults to AND for everything
  orders: Order[] = []; // The sort orders
  includes: string[] = []; // Which related records you want the response to include
  limit?: number; // The limit of records you want the result to have
  page: number = 1; // The page of results you want to be on
  search?: string;
  searchField?: string; // The field you want to search on
  searchOperator: Operator = Operator.LIKE; // The search operator you want to use
  searchQuery?: string | null; // The search query you want to search with
  listView?: number; // Which list view was selected

  /**
   * Adds a condition to the Query
   * @param condition Condition to add
   */
  addCondition(condition: Condition): Query {
    this.conditions.push(condition);
    return this;
  }

  /**
   * Removes all the conditions that were already added to the Query
   */
  clearConditions(): Query {
    this.set("conditions", []);
    return this;
  }

  /**
   * Adds an order to the query, the order in which orders were added determine the sorting of the orders
   * @param order Order to add
   */
  addOrder(order: Order): Query {
    this.orders.push(order);
    return this;
  }

  /**
   * Removes the orders that were already added to the Query
   */
  clearOrders(): Query {
    this.set("orders", []);
    return this;
  }

  /**
   * Adds an include to the Query
   * @param relationshipName The relationship to include in the results
   */
  addInclude(relationshipName: string): Query {
    if (this.includes.indexOf(relationshipName) === -1) {
      this.includes.push(relationshipName);
    }

    return this;
  }

  /**
   * Limits the query to a provided list view
   * @param id The ID of the list view
   */
  setListView(id: number): Query {
    this.set("listView", id);
    return this;
  }

  /**
   * Removes the list view
   */
  clearListView(): Query {
    this.set("listView", undefined);
    return this;
  }

  /**
   * Removes all the includes
   */
  clearIncludes(): Query {
    this.set("includes", []);
    return this;
  }

  /**
   * Limit the results to certain amount of results
   * @param limit the limit
   */
  setLimit(limit: number): Query {
    this.set("limit", limit);
    return this;
  }

  /**
   * Removes the limit
   */
  clearLimit(): Query {
    this.set("limit", undefined);
    return this;
  }

  /**
   * Set the condition logic. For example AND(1,2, OR(3, 4)). The number being the position of the codntion in the condtions array
   * If this value is undefined, AND() will be used for everything
   * @param conditionLogic the logic you want to set
   */
  setConditionLogic(conditionLogic: string): Query {
    this.set("conditionLogic", conditionLogic);
    return this;
  }

  /**
   * Removes the filter logic
   */
  clearConditionLogic(): Query {
    this.set("conditionLogic", undefined);
    return this;
  }

  /**
   * Sets the page of which you want the results to be returned (depending on the limit and the amount of results)
   * @param page The page you want returned
   */
  setPage(page: number): Query {
    this.set("page", page);
    return this;
  }

  /**
   * Clears the page
   */
  clearPage(): Query {
    this.set("page", undefined);
    return this;
  }

  /**
   * Sets the type of model you want to query
   * @param modelName The new model name
   */
  setModelName(modelName: string): Query {
    this.set("modelName", modelName);
    return this;
  }

  /**
   * Sets a search query on the Query.
   * @param search The search query
   * @param searchField The field you want to apply te search to, if this is not provided the first Sort field will be used, if that is undefined 'name' will be used
   */
  setSearch(
    search: string,
    searchOperator: Operator = Operator.LIKE,
    searchField: string | undefined = undefined
  ): Query {
    this.set("search", search);
    this.set("searchField", searchField);
    this.set("searchOperator", searchOperator);
    return this;
  }

  /**
   * Clears the search and the searchfield
   */
  clearSearch(): Query {
    this.set("search", undefined);
    this.set("searchField", undefined);
    this.set("searchOperator", Operator.LIKE);
    return this;
  }

  /**
   * Sets a Search Query, this is unrelated to the `setSearch  function (search and searchField attributes)
   * This will result in a extra filter param _query, that must be handled by the back-end
   * @param searchQuery The search query
   */
  setSearchQuery(searchQuery: string | undefined | null): Query {
    this.set("searchQuery", searchQuery);
    return this;
  }

  /**
   * Removes the search query
   */
  clearSearchQuery(): Query {
    this.set("searchQuery", undefined);
    return this;
  }

  /**
   * Returns the field where the search should be performed on
   */
  get searchFieldComputed(): string {
    if (this.searchField) {
      return this.searchField;
    } else if (this.orders && this.orders.length > 0) {
      return this.orders[0].field;
    } else {
      return "name";
    }
  }

  /**
   * Increments the page by 1
   */
  nextPage() {
    this.incrementProperty("page");
  }

  /**
   * Reduces page by 1
   */
  prevPage() {
    if (this.page > 1) {
      this.decrementProperty("page");
    }
  }

  /**
   * Executes the query, and returns a Promise. Native Ember Data store is used, all fetched models will be loaded in the store
   */
  fetch(store: Store): Promise<any> {
    // First we lookup the default includes and add them to the query
    const defaultIncludes = this.getDefaultIncludes(store);

    for (const defaultInclude of defaultIncludes) {
      this.addInclude(defaultInclude);
    }

    return store.query(this.modelName, this.queryParams);
  }

  /**
   * Executes the query for a single record, and returns a Promise. Native Ember Data store is used, all fetched models will be loaded in the store
   */
  fetchSingle(store: Store): Promise<any> {
    // First we lookup the default includes and add them to the query
    const defaultIncludes = this.getDefaultIncludes(store);

    for (const defaultInclude of defaultIncludes) {
      this.addInclude(defaultInclude);
    }

    const queryParams = this.queryParams;
    queryParams._single = true;

    return store.queryRecord(this.modelName, queryParams);
  }

  /**
   * Returns the default includes defined on the modelclass;
   * @param store The store where you want to search for the default includes of the model
   */
  getDefaultIncludes(store: Store): string[] {
    const modelClass = store.modelFor(this.modelName);

    if (
      modelClass.hasOwnProperty("settings") &&
      modelClass.settings.hasOwnProperty("defaultIncludes")
    ) {
      return modelClass.settings.defaultIncludes;
    }

    return [];
  }

  /**
   * Sets all the values based on the provided Query
   * @param query The query to copy from
   */
  copyFrom(query: Query): Query {
    this.modelName = query.modelName;
    this.conditions = query.conditions;
    this.conditionLogic = query.conditionLogic;
    this.orders = query.orders;
    this.includes = query.includes;
    this.limit = query.limit;
    this.page = query.page;
    this.search = query.search;
    this.searchField = query.searchField;
    this.searchOperator = query.searchOperator;
    this.searchQuery = query.searchQuery;
    this.listView = query.listView;
    return this;
  }

  /**
   * Returns the query parameters that can be used in a EmberData store.query(modelName, queryParams) function.
   */
  get queryParams(): QueryParams {
    const queryParams: QueryParams = {};

    if (this.page > 1) {
      queryParams.page = this.page;
    }

    // The limit of amount of results we want to receive
    if (this.limit) {
      queryParams.limit = this.limit;
    }

    // Any related entities we want to receive
    if (this.includes && this.includes.length > 0) {
      queryParams.include = this.includes.join(",");
    }

    // The sort order of the results
    if (this.orders && this.orders.length > 0) {
      const orders: string[] = [];
      for (const order of this.orders) {
        orders.push(order.orderParam);
      }

      queryParams.sort = orders.join(",");
    }

    // Now the filters
    const filterParam: { [key: string]: QueryFilter | number | string } = {};
    let conditionIndex = 1; // we keep an index over all filters, as each filter will be passed in the query string with as key the index

    // Next we add possible conditions added to the query params object
    if (this.conditions && this.conditions.length > 0) {
      for (const condition of this.conditions) {
        filterParam[conditionIndex++] = condition.conditionParam;
      }
    }

    // We must also check if a search query was passed, and add a condition for it as well
    let alteredLogic = null;
    if (this.search) {
      const searchCondition = new Condition(
        this.searchFieldComputed,
        this.searchOperator,
        this.search
      );

      filterParam[conditionIndex++] = searchCondition.conditionParam;

      // because we added something to the filters based on a search, we must also check for logic
      // Standard, the logic will not thnk of searches. only for conditions that were added to the query

      if (this.conditionLogic) {
        alteredLogic = `AND(${this.conditionLogic}, ${conditionIndex - 1})`;
      }
    }

    if (this.listView) {
      filterParam["_listview"] = this.listView;
    }

    if (this.searchQuery) {
      filterParam["_query"] = this.searchQuery;
    }

    if (alteredLogic) {
      filterParam["_logic"] = alteredLogic;
    } else if (this.conditionLogic) {
      filterParam["_logic"] = this.conditionLogic;
    }

    // And finally, if there were conditions, we add them to the query params
    if (Object.keys(filterParam).length > 0) {
      queryParams.filter = filterParam;
    }

    return queryParams;
  }
}
