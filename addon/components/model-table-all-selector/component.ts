import Component from "@glimmer/component";
import { Column } from "../model-table/component";

interface Arguments {
  column: Column;
}

export default class ModelTableAllSelectorComponent extends Component<
  Arguments
> {}
