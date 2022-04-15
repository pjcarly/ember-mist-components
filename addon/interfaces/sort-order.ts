import MutableArray from "@ember/array/mutable";
import { ListViewInterface } from "../services/list-view";
import FieldInterface from "./field";
import ModelInterface from "./model";

export default interface SortOrderInterface extends ModelInterface {
  name: string;
  direction: string;

  /* Relationships */
  field: FieldInterface;
  listViews: MutableArray<ListViewInterface>;

  /* Functions */
}
