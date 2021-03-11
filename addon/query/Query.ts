import Store from '@ember-data/store';
import Model from '@ember-data/model';
import { A } from '@ember/array';
import HttpService from '@getflights/ember-mist-components/services/http';
import { tracked } from '@glimmer/tracking';
import Condition, { QueryFilter, Operator } from './Condition';
import Order from './Order';

export interface QueryParams {
  page?: {
    number?: number;
    limit?: number;
    includeLimits?: { [key: string]: number };
  };
  include?: string;
  sort?: string;
  filter?: { [key: string]: QueryFilter | number | string };
  _single?: boolean;
  fields?: { [key: string]: string };
}

export default class Query {
  private modelName!: string; // The type of model you want to query
  private conditions: Condition[] = []; // The conditions of the query
  private conditionLogic?: string; // The condition logic you want to use for the condtions. Defaults to AND for everything
  private orders: Order[] = []; // The sort orders
  private includes: string[] = []; // Which related records you want the response to include
  private searchField?: string; // The field you want to search on
  private searchOperator: Operator = Operator.LIKE; // The search operator you want to use
  private searchQuery?: string | null; // The search query you want to search with
  private listView?: number; // Which list view was selected
  private includeDefaultIncludes = true;
  private fields = new Map<string, string[]>();
  private includeLimits = new Map<string, number>();

  @tracked private limit?: number; // The limit of records you want the result to have
  @tracked private page: number = 1; // The page of results you want to be on
  @tracked private search?: string;
  @tracked public results = new QueryResults();

  constructor(modelName: string) {
    this.modelName = modelName;
  }

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
    this.conditions = [];
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
    this.orders = [];
    return this;
  }

  /**
   * Returns the orders
   */
  getOrders(): Order[] {
    return this.orders;
  }

  /**
   * Returns the current page the query is on
   */
  getCurrentPage(): number {
    return this.page;
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
   * Add a limit for an included relationship (to limit the result of an relationship)
   * @param relationshipName The relationship you want to add a limit for
   * @param limit The limit
   */
  addIncludeLimit(relationshipName: string, limit: number): Query {
    this.includeLimits.set(relationshipName, limit);
    return this;
  }

  /**
   * Remove an includeLimit for a relationship
   * @param relationshipName The name of the relationship you want to remove
   */
  removeIncludeLimit(relationshipName: string): Query {
    if (this.includeLimits.has(relationshipName)) {
      this.includeLimits.delete(relationshipName);
    }

    return this;
  }

  /**
   * Check if we have an include limit for a relationshipname
   * @param relationshipName The name of the relationship you want to check
   */
  hasIncludeLimit(relationshipName: string): boolean {
    return this.includeLimits.has(relationshipName);
  }

  /**
   * Remove all the includeLimits
   */
  clearIncludeLimits(): Query {
    this.includeLimits.clear();
    return this;
  }

  /**
   * Limits the query to a provided list view
   * @param id The ID of the list view
   */
  setListView(id: number): Query {
    this.listView = id;
    return this;
  }

  /**
   * Should the query include the default includes defined on the model (defaults to true)
   * @param value Whether or not to include the default model includes
   */
  setIncludeDefaultIncludes(value: boolean): Query {
    this.includeDefaultIncludes = value;
    return this;
  }

  /**
   * Removes the list view
   */
  clearListView(): Query {
    this.listView = undefined;
    return this;
  }

  /**
   * Removes all the includes
   */
  clearIncludes(): Query {
    this.includes = [];
    return this;
  }

  /**
   * Limit the results to certain amount of results
   * @param limit the limit
   */
  setLimit(limit: number): Query {
    this.limit = limit;
    return this;
  }

  /**
   * Removes the limit
   */
  clearLimit(): Query {
    this.limit = undefined;
    return this;
  }

  /**
   * Check if a query has a limit
   */
  hasLimit(): boolean {
    return this.limit !== undefined;
  }

  /**
   * Get the limit
   */
  getLimit(): number | undefined {
    return this.limit;
  }

  /**
   * Set the condition logic. For example AND(1,2, OR(3, 4)). The number being the position of the codntion in the condtions array
   * If this value is undefined, AND() will be used for everything
   * @param conditionLogic the logic you want to set
   */
  setConditionLogic(conditionLogic: string): Query {
    this.conditionLogic = conditionLogic;
    return this;
  }

  /**
   * Removes the filter logic
   */
  clearConditionLogic(): Query {
    this.conditionLogic = undefined;
    return this;
  }

  /**
   * Sets the page of which you want the results to be returned (depending on the limit and the amount of results)
   * @param page The page you want returned
   */
  setPage(page: number): Query {
    this.page = page;
    return this;
  }

  /**
   * Clears the page
   */
  clearPage(): Query {
    this.page = 1;
    return this;
  }

  /**
   * Sets the type of model you want to query
   * @param modelName The new model name
   */
  setModelName(modelName: string): Query {
    this.modelName = modelName;
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
    this.search = search;
    this.searchField = searchField;
    this.searchOperator = searchOperator;
    return this;
  }

  /**
   * Clears the search and the searchfield
   */
  clearSearch(): Query {
    this.search = undefined;
    this.searchField = undefined;
    this.searchOperator = Operator.LIKE;
    return this;
  }

  /**
   * Sets a Search Query, this is unrelated to the `setSearch  function (search and searchField attributes)
   * This will result in a extra filter param _query, that must be handled by the back-end
   * @param searchQuery The search query
   */
  setSearchQuery(searchQuery: string | undefined | null): Query {
    this.searchQuery = searchQuery;
    return this;
  }

  /**
   * Removes the search query
   */
  clearSearchQuery(): Query {
    this.searchQuery = undefined;
    return this;
  }

  /**
   * Add a field for a certain type to limit the query by
   * @param type The type to set a field for
   * @param field The field to set
   */
  addField(type: string, field: string): Query {
    if (!this.fields.has(type)) {
      this.fields.set(type, []);
    }

    this.fields.get(type)?.push(field);
    return this;
  }

  /**
   * Set fields for a certain type
   * @param type The type to set the fields for
   * @param fields Which fields to set
   */
  setFields(type: string, fields: string[]): Query {
    this.fields.set(type, fields);
    return this;
  }

  /**
   * Clear any fields for a possible type
   * @param type The type to clear
   */
  clearFieldsForType(type: string): Query {
    this.fields.delete(type);
    return this;
  }

  /**
   * Clear all the fields
   */
  clearFields(): Query {
    this.fields = new Map<string, string[]>();
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
      return 'name';
    }
  }

  /**
   * Checks if the query has conditions
   */
  get hasConditions(): boolean {
    return this.conditions.length > 0;
  }

  /**
   * Checks if the query has orders
   */
  get hasOrders(): boolean {
    return this.orders.length > 0;
  }

  /**
   * Checks if the query has condition logic
   */
  get hasConditionLogic(): boolean {
    return this.conditionLogic ? true : false;
  }

  /**
   * Increments the page by 1
   */
  nextPage() {
    this.page++;
  }

  /**
   * Reduces page by 1
   */
  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  /**
   * Executes the query, and returns a Promise. Native Ember Data store is used, all fetched models will be loaded in the store
   */
  fetch(store: Store): Promise<any> {
    // First we lookup the default includes and add them to the query
    if (this.includeDefaultIncludes) {
      const defaultIncludes = this.getDefaultIncludes(store);

      for (const defaultInclude of defaultIncludes) {
        this.addInclude(defaultInclude);
      }
    }

    return store
      .query(this.modelName, this.queryParams)
      .then((results: any) => {
        const meta = results.get('meta');
        this.results.resetValues();
        this.results.pageCurrent = meta['page-current'] ?? 1;
        this.results.pageCount = meta['page-count'] ?? 1;
        this.results.pageSize = meta['page-size'] ?? 1;
        this.results.resultRowFirst = meta['result-row-first'] ?? 0;
        this.results.resultRowLast = meta['result-row-last'] ?? 0;
        this.results.totalCount = meta['total-count'] ?? 0;
        this.results.count = <number>results.length;
        return results;
      });
  }

  /**
   * Executes the query for a single record, and returns a Promise. Native Ember Data store is used, all fetched models will be loaded in the store
   */
  fetchSingle(store: Store): Promise<any> {
    // First we lookup the default includes and add them to the query
    if (this.includeDefaultIncludes) {
      const defaultIncludes = this.getDefaultIncludes(store);

      for (const defaultInclude of defaultIncludes) {
        this.addInclude(defaultInclude);
      }
    }

    const queryParams = this.queryParams;
    queryParams._single = true;

    return store
      .queryRecord(this.modelName, queryParams)
      .then((result: any) => {
        this.results.resetValues();

        if (result) {
          this.results.pageCurrent = 1;
          this.results.pageCount = 1;
          this.results.pageSize = 1;
          this.results.resultRowFirst = 1;
          this.results.resultRowLast = 1;
          this.results.totalCount = 1;
          this.results.count = 1;
        }

        return result;
      });
  }

  /**
   * This method can be called when you want to fetch records from an endpoint different than
   * the model endpoint. using fetch or fetchRecord the ModelStore is used to define the endpoint
   * But this method you can use a custom endpoint. This can be useful for:
   *  - An model that can be queried from 2 different endpoints
   *  - An endpoint returning multiple types of models
   *
   * @param http The HTTP service to use for the fetch
   * @param store The store you want to push the results in
   * @param endpoint The endpoint you want to fetch from
   */
  fetchFromEndpoint(
    http: HttpService,
    store: Store,
    endpoint: string
  ): Promise<any> {
    return http
      .fetch(endpoint, 'GET', undefined, this.queryParams)
      .then((response: Response) => {
        this.results.resetValues();

        return response.json().then((results) => {
          if (results.data) {
            const models = A<Model>();
            // Lets push the results in the store
            store.pushPayload(results);

            // And now get each result from the Store
            results.data.forEach((result: any) => {
              const model = <Model>store.peekRecord(result.type, result.id);
              models.pushObject(model);
            });

            if (results.meta) {
              this.results.pageCurrent = results.meta['page-current'] ?? 1;
              this.results.pageCount = results.meta['page-count'] ?? 1;
              this.results.pageSize = results.meta['page-size'] ?? 1;
              this.results.resultRowFirst = results.meta['result-row-first'] ?? 0;
              this.results.resultRowLast = results.meta['result-row-last'] ?? 0;
              this.results.totalCount = results.meta['total-count'] ?? 0;
              this.results.count = <number>results.data.length;
              return results;
            }
          }
        });
      });
  }

  /**
   * Returns the default includes defined on the modelclass;
   * @param store The store where you want to search for the default includes of the model
   */
  getDefaultIncludes(store: Store): string[] {
    const modelClass = store.modelFor(this.modelName);

    if (
      modelClass.hasOwnProperty('settings') &&
      modelClass.settings.hasOwnProperty('defaultIncludes')
    ) {
      return modelClass.settings.defaultIncludes;
    }

    return [];
  }

  /**
   * Sets all the values based on the provided Query
   * IMPORTANT: all previous values will be overridden
   * @param query The query to copy from
   */
  copyFrom(query: Query): Query {
    this.modelName = query.modelName;

    this.clearConditions();
    query.conditions.forEach((condition) => {
      this.addCondition(
        new Condition(
          condition.field,
          condition.operator,
          condition.value,
          condition.id
        )
      );
    });

    this.conditionLogic = query.conditionLogic;

    this.clearOrders();
    query.orders.forEach((order) => {
      this.addOrder(new Order(order.field, order.direction));
    });

    this.includes = query.includes.slice();
    this.limit = query.limit;
    this.page = query.page;
    this.search = query.search;
    this.searchField = query.searchField;
    this.searchOperator = query.searchOperator;
    this.searchQuery = query.searchQuery;
    this.listView = query.listView;
    this.fields = new Map(query.fields);
    this.includeLimits = new Map(query.includeLimits);
    return this;
  }

  /**
   * Returns the query parameters that can be used in a EmberData store.query(modelName, queryParams) function.
   */
  get queryParams(): QueryParams {
    const queryParams: QueryParams = {};

    if (this.page > 1) {
      queryParams.page = {
        number: this.page,
      };
    }

    // The limit of amount of results we want to receive
    if (this.limit) {
      if (!queryParams.page) {
        queryParams.page = {};
      }
      queryParams.page.limit = this.limit;
    }

    if (this.includeLimits.size > 0) {
      if (!queryParams.page) {
        queryParams.page = {};
      }
      queryParams.page.includeLimits = {};

      this.includeLimits.forEach((limit, relationshipName) => {
        if (queryParams.page?.includeLimits) {
          queryParams.page.includeLimits[relationshipName] = limit;
        }
      });
    }

    // Any related entities we want to receive
    if (this.includes && this.includes.length > 0) {
      queryParams.include = this.includes.join(',');
    }

    // The sort order of the results
    if (this.orders && this.orders.length > 0) {
      const orders: string[] = [];
      for (const order of this.orders) {
        orders.push(order.orderParam);
      }

      queryParams.sort = orders.join(',');
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
      filterParam['_listview'] = this.listView;
    }

    if (this.searchQuery) {
      filterParam['_query'] = this.searchQuery;
    }

    if (alteredLogic) {
      filterParam['_logic'] = alteredLogic;
    } else if (this.conditionLogic) {
      filterParam['_logic'] = this.conditionLogic;
    }

    if (this.fields.size > 0) {
      const fieldsParam: { [key: string]: string } = {};
      for (const [key, value] of this.fields.entries()) {
        fieldsParam[key] = value.join(',');
      }

      queryParams.fields = fieldsParam;
    }

    // And finally, if there were conditions, we add them to the query params
    if (Object.keys(filterParam).length > 0) {
      queryParams.filter = filterParam;
    }

    return queryParams;
  }
}

export class QueryResults {
  /**
   * Amount of results
   */
  @tracked count = 0;

  /**
   * Total amount in all the pages
   */
  @tracked totalCount = 0;

  /**
   * How many pages
   */
  @tracked pageCount = 1;

  /**
   * How big the page is
   */
  @tracked pageSize = 1;

  /**
   * What page the query is currently on
   */
  @tracked pageCurrent = 1;

  /**
   * What result of the total count is displayed as the first record in this page
   */
  @tracked resultRowFirst = 0;

  /**
   * What result of the total count is displayed as the last record in this page
   */
  @tracked resultRowLast = 0;

  resetValues() {
    this.count = 0;
    this.totalCount = 0;
    this.pageCount = 1;
    this.pageSize = 1;
    this.pageCurrent = 1;
    this.resultRowFirst = 0;
    this.resultRowLast = 0;
  }
}
