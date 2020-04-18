// @ts-ignore
import Row from "ember-light-table/components/lt-row";
import { readOnly } from "@ember/object/computed";
import { className } from "@ember-decorators/component";

export default class LtRowComponent extends Row {
  @className
  @readOnly("row.activated")
  isActivated!: boolean;

  @className
  @readOnly("row.rowSelected")
  isRowSelected!: boolean;
}
