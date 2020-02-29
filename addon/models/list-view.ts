import QueryModel from "../models/query";
import { isBlank } from "@ember/utils";
import { field } from "ember-field-components/model/attribute";
import attr from "ember-data/attr";
import { hasMany, belongsTo } from "ember-data/relationships";
import MutableArray from "@ember/array/mutable";
import FieldModel from "./field";
import MetaModelModel from "./meta-model";

export default class ListViewModel extends QueryModel {
  changeTracker = { trackHasMany: true };

  @field("string", { validation: { required: true } })
  name!: string;

  @field("string")
  grouping?: string;

  @field("string")
  conditionLogic?: string;

  @field("number", { precision: 10, decimals: 0, defaultValue: 10 })
  rows?: number;

  @field("number", { precision: 10, decimals: 0 })
  sort?: number;

  @attr()
  sortOrder: any; // pseudo attribute which will contain an object with the sort order. This is only serialized by the back-end. And cant be updated. Use the hasMany relationship sortOrders instead

  @belongsTo("meta-model", {
    widget: "select",
    async: false,
    validation: { required: true }
  })
  model!: MetaModelModel;

  @hasMany("field", { async: false, widget: "select", validation: { required: true } })
  columns!: MutableArray<FieldModel>;

  /* Functions */
  conditionsValid(): boolean {
    let conditionsValid = true;

    if (!isBlank(this.conditions)) {
      this.conditions.toArray().forEach(condition => {
        condition.setName();
        conditionsValid = condition.validate();
      });
    }

    return conditionsValid;
  }

  ordersValid(): boolean {
    let ordersValid = true;

    if (!isBlank(this.orders)) {
      this.orders.toArray().forEach(order => {
        order.setName();
        ordersValid = order.validate();
      });
    }

    return ordersValid;
  }

  static settings = {
    listViews: {
      default: {
        columns: ["name", "grouping"],
        rows: 10,
        sortOrder: {
          field: "created",
          dir: "desc"
        }
      }
    }
  };
}
