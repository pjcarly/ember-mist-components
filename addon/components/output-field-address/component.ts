import InputFieldAddressComponent from "@getflights/ember-mist-components/components/input-field-address/component";
import { replaceAll } from "@getflights/ember-field-components/classes/utils";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";

export default class OutputFieldAddressComponent extends InputFieldAddressComponent {
  @computed("displayRows")
  get outputDisplayRows(): any[] {
    let outputDisplayRows = [];

    if (!isBlank(this.displayRows)) {
      for (let row of this.displayRows) {
        let emptyRow = true;
        for (let column of row.columns) {
          column.component = replaceAll(column.component, "input", "output");

          if (emptyRow) {
            // @ts-ignore
            emptyRow = isBlank(this.address.get(column.field));
          }
        }

        row.emptyRow = emptyRow;
        outputDisplayRows.push(row);
      }
    }

    return outputDisplayRows;
  }
}
