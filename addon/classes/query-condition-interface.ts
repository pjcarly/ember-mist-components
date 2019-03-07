export default interface QueryConditionInterface {
  /**
   * The field that you want to set a condition on
   */
  field: string;

  /**
   * The operator used in the condition, if this is null equals (=) will be used
   * Allowed values: '=', '<>', '>', '>=', '<', '<=', 'LIKE', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH'
   */
  operator?: string;

  /**
   * The value in the condition
   */
  value: string;
}
