import Component from "@glimmer/component";
import { Column, Row } from "../model-table/component";

interface Arguments {
  row: Row;
  column: Column;
}

export default class ModelTableSelectorComponent extends Component<Arguments> {}
