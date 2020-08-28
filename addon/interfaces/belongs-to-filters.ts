import { Operator } from "@getflights/ember-mist-components/query/Condition";

export default interface BelongsToFilterInterface {
  field: string;
  operator: Operator | undefined;
  value: string | number | boolean;
}
