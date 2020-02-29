import { hasMany } from "ember-data/relationships";
import DrupalModel from "ember-mist-components/models/drupal-model";
import MutableArray from "@ember/array/mutable";
import ConditionModel from "./condition";
import SortOrderModel from "./order";

export default class QueryModel extends DrupalModel {
  @hasMany("condition", { inverse: "parent", async: false })
  conditions!: MutableArray<ConditionModel>;

  @hasMany("order", { inverse: "parent", async: false })
  orders!: MutableArray<SortOrderModel>;
}
