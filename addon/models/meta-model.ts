import Model from "ember-data/model";
import attr from "ember-data/attr";
import { alias } from "@ember/object/computed";
import { hasMany } from "ember-data/relationships";
import MutableArray from "@ember/array/mutable";
import FieldModel from "./field";

export default class MetaModelModel extends Model {
  @attr("string")
  entity?: string;

  @attr("string")
  bundle?: string;

  @attr("string")
  label?: string;

  @attr("string")
  plural?: string;

  @alias("label")
  name?: string;

  @hasMany("field")
  fields!: MutableArray<FieldModel>;

  static settings = {
    listViews: {
      default: {
        columns: ["label"],
      },
    },
  };
}
