import { belongsTo } from "ember-data/relationships";
import DrupalModel from "ember-mist-components/models/drupal-model";
import { field } from "ember-field-components/model/attribute";
import QueryModel from "./query";
import FieldModel from "ember-mist-components/addon/models/field";

export default class ConditionModel extends DrupalModel {
  @field("string", { validation: { required: true } })
  name!: string;

  @field("select", { validation: { required: true } })
  operator!: string;

  @field("string", { validation: { required: true } })
  value!: string;

  @field("number", { precision: 10, decimals: 0 })
  sort?: number;

  /* Relationships */
  @belongsTo("field", { widget: "select", async: false, validation: { required: true } })
  field!: FieldModel;

  @belongsTo("query", { validation: { required: true }, async: false })
  parent!: QueryModel;

  setName() {
    const name: string[] = [];
    name.push(this.field);
    name.push(this.operator);
    name.push(this.value);

    this.set("name", name.join(" "));
  }

  static settings = {
    listViews: {
      default: {
        columns: ["parent", "field", "operator", "value"],
        rows: 10,
        sortOrder: {
          field: "created",
          dir: "desc"
        }
      }
    }
  };
}
