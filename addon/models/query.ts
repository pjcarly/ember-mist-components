import { hasMany } from "ember-data/relationships";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import MutableArray from "@ember/array/mutable";
import ConditionModel from "./condition";
import SortOrderModel from "./order";

export default class QueryModel extends DrupalModel {
  // @ts-ignore
  @hasMany("condition", { inverse: "parent", rollback: true, async: false })
  conditions!: MutableArray<ConditionModel>;

  // @ts-ignore
  @hasMany("order", { inverse: "parent", rollback: true, async: false })
  orders!: MutableArray<SortOrderModel>;
}
