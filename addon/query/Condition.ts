import { replaceAll } from "@getflights/ember-field-components/classes/utils";

export interface QueryFilter {
  field: string;
  operator: string | undefined;
  value: string | number | boolean | null | undefined;
  id: string | number | (string|number)[] | undefined;
}

export enum Operator {
  EQUALS = "=",
  NOT = "<>",
  LARGER = ">",
  LARGER_OR_EQUALS = ">=",
  SMALLER = "<",
  SMALLER_OR_EQUALS = "<=",
  LIKE = "LIKE",
  CONTAINS = "CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  IN = "IN",
  NOT_IN = "NOT IN",
  BETWEEN = "BETWEEN",
}

export default class Condition {
  field!: string;
  operator: string = "=";
  value: string | number | boolean | string[] | number[] | null | undefined;
  id: string | number | (string|number)[] | undefined;

  constructor(
    field: string,
    operator: string,
    value:
      | string
      | number
      | boolean
      | string[]
      | number[]
      | null
      | undefined = undefined,
    id: string | number | (string|number)[] | undefined = undefined
  ) {
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.id = id;
  }

  parseValue(
    value: string | number | boolean | (string|number)[] | null | undefined
  ): string {
    let returnValue = "null";

    if (value instanceof Array) {
      returnValue = value.join(",");
    } else {
      returnValue = (value || value === 0) ? value + "" : "null";
    }

    if (this.operator === Operator.LIKE) {
      // When the operator is "like", we change the wildard from * to %
      returnValue = replaceAll(returnValue, "*", "%");
    }

    return returnValue;
  }
  /**
   * Returns a Mist Platform compliant filter condition param;
   */
  get conditionParam(): QueryFilter {
    // @ts-ignore
    const filter: QueryFilter = {
      field: this.field,
    };

    if (this.id) {
      // an ID was passed, we use it over value
      if (!this.operator || this.operator === Operator.EQUALS) {
        // equals is the default operator, and doesnt need to be explicitly passed
        filter.id = this.parseValue(this.id);
      } else {
        // A different operator was provided, lets pass it in the filter
        filter.operator = this.operator;
        filter.id = this.parseValue(this.id);
      }
    } else {
      // ID is blank, we can just use the value logic
      if (!this.operator || this.operator === Operator.EQUALS) {
        // equals is the default operator, and doesnt need to be explicitly passed
        filter.value = this.parseValue(this.value);
      } else {
        // A different operator was provided, lets pass it in the filter
        filter.operator = this.operator;
        filter.value = this.parseValue(this.value);
      }
    }

    return filter;
  }
}
