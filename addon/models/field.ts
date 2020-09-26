import Model, { attr, belongsTo } from "@ember-data/model";
import MetaModelModel from "./meta-model";

export default class FieldModel extends Model {
  @attr("string")
  name!: string;

  @attr("string")
  label!: string;

  @attr("string")
  apiName!: string;

  @attr("number")
  cardinality!: number;

  @attr("string")
  defaultValue?: string;

  @attr()
  selectOptions?: any;

  /* Relationships */
  @belongsTo("meta-model", { inverse: "fields", async: false })
  model!: MetaModelModel;

  static settings = {
    listViews: {
      default: {
        columns: ["label"],
        rows: 10,
        sortOrder: {
          field: "created",
          dir: "desc",
        },
      },
    },
  };
}
