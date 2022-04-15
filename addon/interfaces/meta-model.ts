import MutableArray from "@ember/array/mutable";
import FieldInterface from "./field";
import ModelInterface from "./model";

export default interface MetaModelInterface extends ModelInterface {
  entity?: string;
  bundle?: string;
  label?: string;
  plural?: string;
  name?: string;

  fields: MutableArray<FieldInterface>;
}
