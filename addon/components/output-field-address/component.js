import InputAddress from 'ember-mist-components/components/input-field-address/component';
import { replaceAll } from 'ember-field-components/classes/utils';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default InputAddress.extend({
  outputDisplayRows: computed('displayRows', function(){
    const { displayRows, address } = this.getProperties('displayRows', 'address');
    let outputDisplayRows = [];

    if(!isBlank(displayRows)) {
      for(let row of displayRows) {
        let emptyRow = true;
        for(let column of row.columns) {
          column.component = replaceAll(column.component, 'input', 'output');

          if(emptyRow) {
            emptyRow = isBlank(address.get(column.field));
          }
        }

        row.emptyRow = emptyRow;
        outputDisplayRows.push(row);
      }
    }

    return outputDisplayRows;
  })
});
