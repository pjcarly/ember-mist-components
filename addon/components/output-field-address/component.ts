import InputFieldAddressComponent from "@getflights/ember-mist-components/components/input-field-address/component";
import { isBlank } from "@ember/utils";

export default class OutputFieldAddressComponent extends InputFieldAddressComponent {
  get outputDisplayRows(): any[] {
    let outputDisplayRows = [];

    if (this.displayRows) {
      for (const row of this.displayRows) {
        let emptyRow = true;
        for (const column of row.columns) {
          if (emptyRow) {
            // @ts-ignore
            emptyRow = isBlank(this.value.get(column.field));
          }
        }

        row.emptyRow = emptyRow;
        outputDisplayRows.push(row);
      }
    }

    return outputDisplayRows;
  }
}
