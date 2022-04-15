import ModelInterface from "./model";
import FieldInterface from "./field";
import MutableArray from "@ember/array/mutable";
import { ListViewInterface } from "../services/list-view";

export default interface ConditionInterface extends ModelInterface {
  name: string;
  operator: string;
  value: string;

  /* Relationships */
  field: FieldInterface;
  listViews: MutableArray<ListViewInterface>;
}
