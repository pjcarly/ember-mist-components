import { belongsTo } from "ember-data/relationships";
import DrupalModel from "ember-mist-components/models/drupal-model";
import { field } from "ember-field-components/model/attribute";
import QueryModel from "./query";
import FieldModel from "./field";

export default class SortOrderModel extends DrupalModel {
  @field("string", { validation: { required: true } })
  name!: string;

  @field("select", { validation: { required: true } })
  direction!: string;

  @field("number", { precision: 10, decimals: 0 })
  sort?: number;

  /* Relationships */
  @belongsTo("field", {
    widget: "select",
    async: false,
    validation: { required: true }
  })
  field!: FieldModel;

  @belongsTo("query", { validation: { required: true }, async: false })
  parent!: QueryModel;

  /* Functions */
  setName() {
    const name: string[] = [];
    name.push(this.field.id);
    name.push(this.direction);

    this.set("name", name.join(" "));
  }

  static settings = {
    listViews: {
      default: {
        columns: ["name", "field", "direction", "parent"],
        rows: 10,
        sortOrder: {
          field: "created",
          dir: "desc"
        }
      }
    }
  };
}
