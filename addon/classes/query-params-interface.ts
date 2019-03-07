import QueryConditionInterface from 'ember-mist-components/classes/query-condition-interface';

export default interface QueryParamsInterface {
  /**
   * The page number of the query results
   */
  page?: number;

  /**
   * The limit of amount of results
   */
  limit?: number;

  /**
   * The field you want to sort on
   */
  sort?: string;

  /**
   * The sorting direction, allowed values are ASC and DESC
   */
  dir?: string;

  /**
   * The search string you want to search on
   */
  search?: string;

  /**
   * The include string in the query
   */
  include?: string;

  /**
   * The base conditions that will be added to the query (query logic will not be applied here)
   */
  baseConditions: Array<QueryConditionInterface>;

  /**
   * The conditions that will be applied to the query. Query Logic is applied here.
   */
  conditions: Array<QueryConditionInterface>;
}
