import { replaceAll } from 'ember-field-components/classes/utils';

export interface QueryFilter {
  field: string;
  operator: string | undefined;
  value: string | number | boolean | null | undefined;
  id: string | number | undefined;
}

export default class Condition {
  field !: string;
  operator : string = '=';
  value : string | number | boolean | null | undefined;
  id : string | number | undefined;

  constructor(field : string, operator : string, value : string | number | boolean | null | undefined = undefined, id : string | number | undefined = undefined) {
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.id = id;
  }

  /**
   * Returns a Mist Platform compliant filter condition param;
   */
  get conditionParam() : QueryFilter {
    const filter : QueryFilter = {
      field: this.field
    };

    if(this.id) {
      // an ID was passed, we use it over value
      if(this.operator || this.operator === '=') {
        // equals is the default operator, and doesnt need to be explicitly passed
        filter.id = this.id;
      } else {
        // A different operator was provided, lets pass it in the filter
        filter.operator = this.operator;

        if(this.operator === 'like') {
          // When the operator is "like", we change the wildard from * to %
          filter.id = replaceAll(this.id, '*', '%');
        } else {
          filter.id = this.id;
        }
      }
    } else {
      // ID is blank, we can just use the value logic
      if(!this.operator || this.operator === '='){
        // equals is the default operator, and doesnt need to be explicitly passed
        filter.value = this.value;
      } else {
        // A different operator was provided, lets pass it in the filter
        filter.operator = this.operator;

        if(this.operator === 'like'){
          // When the operator is "like", we change the wildard from * to %
          filter.value = replaceAll(this.value, '*', '%');
        } else {
          filter.value = this.value;
        }
      }
    }

    return filter;
  }
}
