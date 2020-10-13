import Component from "@glimmer/component";
import { Row } from "../model-table/component";

interface Arguments {
  row: Row;
}

export default class ModelTableSelectorComponent extends Component<Arguments> {}
