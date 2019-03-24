import Store from 'ember-data/store';
import Condition, { QueryFilter } from './Condition';
import Order from './Order';

export interface QueryParams {
  page: number;
  include: string;
  sort: string;
  limit: number;
  filter: { [key:number] : QueryFilter };
}

export default class Query {
  modelName !: string;
  conditions : Condition[] = [];
  orders : Order[] = [];
  includes : string[] = [];
  limit : number | undefined;
  page : number | undefined;
  search : string | undefined;
  searchField : string | undefined;
  listView : number | undefined;

  /**
   * @param modelName The name of the model you want to query
   */
  constructor(modelName : string) {
    this.modelName = modelName;
  }

  /**
   * Adds a condition to the Query
   * @param condition Condition to add
   */
  addCondition(condition : Condition) : Query {
    this.conditions.push(condition);
    return this;
  }

  /**
   * Removes all the conditions that were already added to the Query
   */
  clearConditions() : Query {
    this.conditions = [];
    return this;
  }

  /**
   * Adds an order to the query, the order in which orders were added determine the sorting of the orders
   * @param order Order to add
   */
  addOrder(order : Order) : Query {
    this.orders.push(order);
    return this;
  }

  /**
   * Removes the orders that were already added to the Query
   */
  clearOrders() : Query {
    this.orders = [];
    return this;
  }

  /**
   * Adds an include to the Query
   * @param relationshipName The relationship to include in the results
   */
  addInclude(relationshipName : string) : Query {
    this.includes.push(relationshipName);
    return this;
  }

  /**
   * Limits the query to a provided list view
   * @param id The ID of the list view
   */
  setListView(id : number) : Query {
    this.listView = id;
    return this;
  }

  /**
   * Removes the list view
   */
  clearListView() : Query {
    this.listView = undefined;
    return this;
  }

  /**
   * Removes all the includes
   */
  clearIncludes() : Query {
    this.includes = [];
    return this;
  }

  /**
   * Limit the results to certain amount of results
   * @param limit the limit
   */
  setLimit(limit : number) : Query {
    this.limit = limit;
    return this;
  }

  /**
   * Removes the limit
   */
  clearLimit() : Query {
    this.limit = undefined;
    return this;
  }

  /**
   * Sets the page of which you want the results to be returned (depending on the limit and the amount of results)
   * @param page The page you want returned
   */
  setPage(page : number) : Query {
    this.page = page;
    return this;
  }

  /**
   * Clears the page
   */
  clearPage() : Query {
    this.page = undefined;
    return this;
  }

  /**
   * Sets a search query on the Query.
   * @param search The search query
   * @param searchField The field you want to apply te search to, if this is not provided the first Sort field will be used, if that is undefined 'name' will be used
   */
  setSearch(search : string, searchField : string | undefined = undefined) : Query {
    this.search = search;
    this.searchField = searchField;
    return this;
  }

  /**
   * Clears the search and the searchfield
   */
  clearSearch() : Query {
    this.search = undefined;
    this.searchField = undefined;
    return this;
  }

  get searchFieldComputed() : string {
    if(this.searchField) {
      return this.searchField;
    } else if (this.orders && this.orders.length > 0) {
      return this.orders[0].field;
    } else {
      return 'name';
    }
  }

  /**
   * Executes the query, and returns a Promise. Native Ember Data store is used, all fetched models will be loaded in the store
   */
  fetch(store: Store) : Promise<any> {

    // First we lookup the default includes and add them to the query
    const defaultIncludes = this.getDefaultIncludes(store);

    for(const defaultInclude of defaultIncludes) {
      this.addInclude(defaultInclude);
    }

    return store.query(this.modelName, this.queryParams);
  }

  /**
   * Returns the default includes defined on the modelclass;
   * @param store The store where you want to search for the default includes of the model
   */
  getDefaultIncludes(store : Store) : string[] {
    const modelClass = store.modelFor(this.modelName);

    if(modelClass.hasOwnProperty('settings') && modelClass.settings.hasOwnProperty('defaultIncludes')) {
      return modelClass.settings.defaultIncludes;
    }

    return [];
  }

  /**
   * Returns the query parameters that can be used in a EmberData store.query(modelName, queryParams) function.
   */
  get queryParams() : QueryParams {
    const queryParams : QueryParams = {};

    if(this.page) {
      queryParams.page = this.page;
    }

    // The limit of amount of results we want to receive
    if(this.limit) {
      queryParams.limit = this.limit;
    }

    // Any related entities we want to receive
    if(this.includes && this.includes.length > 0) {
      queryParams.include = this.includes.join(',');
    }

    // The sort order of the results
    if(this.orders && this.orders.length > 0) {
      const orders : string[] = [];
      for(const order of this.orders){
        orders.push(order.orderParam);
      }

      queryParams.sort = orders.join(',');
    }

    // Now the filters
    const filterParam : { [key:number] : QueryFilter } = {};
    let conditionIndex = 1; // we keep an index over all filters, as each filter will be passed in the query string with as key the index

    // Next we add possible conditions added to the query params object
    if(this.conditions && this.conditions.length > 0) {
      for(const condition of this.conditions) {
        filterParam[conditionIndex++] = condition.conditionParam;
      }
    }

    // We must also check if a search query was passed, and add a condition for it as well
    if(this.search) {
      const searchCondition = new Condition(this.searchFieldComputed, 'like', this.search);
      filterParam[conditionIndex++] = searchCondition.conditionParam;
    }

    if(this.listView) {
      filterParam['_listview'] = this.listView;
      conditionIndex++;
    }

    // And finally, if there were conditions, we add them to the query params
    if(conditionIndex > 1) {
      queryParams.filter = filterParam;
    }

    return queryParams;
  }
}
