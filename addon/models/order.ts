import { belongsTo } from "@ember-data/model";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { field } from "@getflights/ember-mist-components/decorators/attribute";
import QueryModel from "./query";
import FieldModel from "./field";

export default class SortOrderModel extends DrupalModel {
  @field("string")
  name!: string;

  @field("select", { validation: { required: true } })
  direction!: string;

  @field("number", { precision: 10, decimals: 0 })
  sort?: number;

  /* Relationships */
  // @ts-ignore
  @belongsTo("field", {
    widget: "select",
    async: false,
    validation: { required: true },
  })
  field!: FieldModel;

  // @ts-ignore
  @belongsTo("query", { validation: { required: true }, async: false })
  parent!: QueryModel;

  /* Functions */
  static settings = {
    listViews: {
      default: {
        columns: ["name", "field", "direction", "parent"],
        rows: 10,
        sortOrder: {
          field: "created",
          dir: "desc",
        },
      },
    },
  };
}
