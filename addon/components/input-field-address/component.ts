import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
import Address from "@getflights/ember-mist-components/models/address";
import AddressService from "@getflights/ember-mist-components/services/address";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { task, taskGroup } from "ember-concurrency";
import { isBlank } from "@ember/utils";
import { isNone } from "@ember/utils";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { taskFor } from "ember-concurrency-ts";
import { tracked } from "@glimmer/tracking";
import Store from "@ember-data/store";

class DisplayRow {
  columns: DisplayColumn[] = [];
  amountOfColumns!: number;
  columnClassName!: string;
  @tracked emptyRow = false;
}

class DisplayColumn {
  label!: string;
  field!: string;
  component!: string;
  none?: string;
  selectOptions?: SelectOption[];
  disabled?: boolean;
}

export interface InputFieldAddressArguments
  extends InputFieldArguments<Address> {
  options?: InputFieldAddressOptionsArgument;
}

export interface InputFieldAddressOptionsArgument {
  countryChanged?: (countryCode?: string) => void;
}

export default class InputFieldAddressComponent extends InputFieldComponent<
  InputFieldAddressArguments,
  Address
> {
  // @ts-ignore
  @service("address") addressing!: AddressService;
  @service store !: Store;

  @taskGroup addressLoading!: any;
  @tracked displayRows: DisplayRow[] = [];
  @tracked protected fragment!: Address;

  constructor(owner: any, args: InputFieldArguments<Address>) {
    super(owner, args);
    taskFor(this.initialize).perform();
  }

  @task({ group: "addressLoading" })
  async initialize() {
    if (!this.value) {
      const address = <Address>this.store
        // @ts-ignore
        .createFragment("address", {});

      this.setNewValue(address);
    }

    await taskFor(this.setAddressFormat).perform();
  }

  @task({ group: "addressLoading" })
  async setAddressFormat() {
    if (!this.value) {
      return;
    }

    await taskFor(this.value.loadFormat).perform();
    await taskFor(this.setDisplayRows).perform();
  }

  /**
   * Here we build the structure the component must be formatted in the template
   * we disect the addressformat, and find out how we must display the individual components
   * - some countries don't use parts of an address
   * - depending on the country, some parts are required, some parts not
   * - depending on the country, a selectlist for certain parts are used (f/e US States)
   * - depending on the country some parts have a different label (state, province, region, island, ...)
   */
  @task({ group: "addressLoading" })
  async setDisplayRows() {
    if (!this.value) {
      this.displayRows = [];
      return;
    }

    const addressFormat = this.value.format;
    const rows: DisplayRow[] = [];

    if (
      !isBlank(addressFormat) &&
      !isBlank(addressFormat.data.attributes.format)
    ) {
      const format = addressFormat.data.attributes.format;

      let rawStructurePerLine = format.split("\n");

      for (let rawLine of rawStructurePerLine) {
        let rawColumns = rawLine.split("%");
        let row = new DisplayRow();
        row.columns = [];

        for (let rawColumn of rawColumns) {
          rawColumn = rawColumn.replace(/[^0-9a-z]/gi, ""); // we remove all none alpha numeric characters
          if (rawColumn) {
            let column = await taskFor(this.getDisplayColumnnForField).perform(
              rawColumn,
              addressFormat
            );
            if (column) {
              row.columns.push(column);
            }
          }
        }

        row.amountOfColumns = row.columns.length;

        if (row.amountOfColumns > 0) {
          row.columnClassName = `col-${12 / row.amountOfColumns}`;
          rows.push(row);
        }
      }
    }

    this.displayRows = rows;
  }

  @task({ group: "addressLoading" })
  async getDisplayColumnnForField(
    field: string,
    format: any
  ): Promise<DisplayColumn | undefined> {
    if (
      field !== "familyName" &&
      field !== "givenName" &&
      field !== "organization" &&
      field !== "additionalName"
    ) {
      const selectlistDepth = format.data.attributes["subdivision-depth"];
      const requiredFields = format.data.attributes["required-fields"];

      let column = new DisplayColumn();
      column.label = format.data.attributes.labels[field];
      column.field = field;

      // lets add a * in case the field is required to complete the address
      if (requiredFields.indexOf(field) !== -1) {
        // the field is required
        column.label += " *";
      }

      // Here we must figure out what type of component to use to display the input field
      if (selectlistDepth === 0) {
        // No depth, so everything in the format is just plain text
        column.component = "text";
      } else {
        // We have a depth, meaning there are select options available, so now we must figure out:
        // - if this field is a select field or a plain text field
        // - and if it is a select field, find out if we can display it (if a parent value is filled in)
        //   for example: you can't know the cities, if you don't know the province of the address

        const usedFields = format.data.attributes["used-fields"]; // this is an array, containing the used fields in the format, sorted from big to small
        const positionOfField = usedFields.indexOf(field) + 1; // 0-based

        if (positionOfField > selectlistDepth) {
          // the position is larger than the depth, this is a plain text field
          column.component = "text";
        } else {
          // position is within the depth, now we must figure out if it parent values are filled in so we can display this field
          // and if this field is a plain text field, or a select
          // - some countries have a selectfield on city for example for 1 province, but a plain text for city on another province
          // - South Korea for example

          let isDisabled = false; // is this field disabled (for now)
          if (positionOfField > 1) {
            // now it gets really tricky, we must check parents have values before we can make this field editable
            const parentField = usedFields[positionOfField - 2]; // remember 0-based
            // @ts-ignore
            isDisabled = isBlank(this.value.get(parentField));
          }

          // this is the top most field, we don't need to mind parent values

          if (!isDisabled) {
            // @ts-ignore
            let subdivisionSelectOptions = this[`${field}SelectOptions`];

            if (isNone(subdivisionSelectOptions)) {
              const parentGrouping = this.getParentGroupingForField(field);
              subdivisionSelectOptions = await taskFor(
                this.getSubdivisionSelectOptions
              ).perform(parentGrouping);
            }

            if (isBlank(subdivisionSelectOptions)) {
              // no select options found, this is just a plain text field
              column.component = "text";
            } else {
              column.none = `-- ${column.label} --`;
              column.component = "select";
              column.selectOptions = subdivisionSelectOptions;
              column.disabled = isDisabled;
            }
          } else {
            // a disabled field, lets only display 1 option, as they will be rerendered anyway
            column.none = `-- ${column.label} --`;
            column.component = "select";
            column.selectOptions = [];
            column.disabled = isDisabled;
          }
        }
      }

      return column;
    }

    return;
  }

  @task({ group: "addressLoading" })
  async getSubdivisionSelectOptions(parentGrouping: string) {
    // a subdivision is basically a generic name for an address component which has selectoptions that need to be fetched
    const selectoptions: SelectOption[] | undefined = await taskFor(
      this.addressing.getSubdivisionSelectOptions
    ).perform(parentGrouping);
    return selectoptions;
  }

  reRenderRows(editedField: string): void {
    if (!this.value) {
      return;
    }

    const format = this.value.format;
    const selectlistDepth = format.data.attributes["subdivision-depth"];

    if (selectlistDepth !== 0) {
      // only need to be rerendered if there are potential dependent address fields
      const usedFields = format.data.attributes["used-fields"]; // this is an array, containing the used fields in the format, sorted from big to small
      const positionOfField = usedFields.indexOf(editedField) + 1; // 0-based

      if (positionOfField < selectlistDepth) {
        taskFor(this.setDisplayRows).perform();
      }
    }
  }

  /**
   * Here we reset values of address, for fields where parent dependencies change
   */
  resetValues(editedField: string) {
    // @ts-ignore
    const addressFormat = this.value.get("format");
    const selectlistDepth = addressFormat.data.attributes["subdivision-depth"];

    if (selectlistDepth !== 0) {
      // only need to be reset if there are potential dependent address fields
      const usedFields = addressFormat.data.attributes["used-fields"]; // this is an array, containing the used fields in the format, sorted from big to small
      const zeroBasedPositionOfField = usedFields.indexOf(editedField);

      if (zeroBasedPositionOfField + 1 < selectlistDepth) {
        for (let i = zeroBasedPositionOfField + 1; i < selectlistDepth; i++) {
          // @ts-ignore
          this.value.set(usedFields[i], null);
        }
      }
    }
  }

  getParentGroupingForField(field: string): string {
    const address = this.value;

    if (!address) {
      return "";
    }

    const addressFormat = address.format;
    const usedFields = addressFormat.data.attributes["used-fields"]; // this is an array, containing the used fields in the addressFormat, sorted from big to small
    const zeroBasedPositionOfField = usedFields.indexOf(field);

    let parentValues = [];
    parentValues.push(addressFormat.data.attributes["country-code"]); // country value is always the first, but not provided in the addressFormat's used fields

    for (let i = 0; i < zeroBasedPositionOfField; i++) {
      // @ts-ignore
      const parentValue = address.get(usedFields[i]);
      parentValues.push(parentValue);
    }

    return parentValues.join(",");
  }

  /**
   * Removes the errors on the model address field
   */
  removeAddressErrors() {
    this.args.model.errors
      // @ts-ignore
      .remove(this.field);
  }

  cancelAllTasks() {
    taskFor(this.getSubdivisionSelectOptions).cancelAll();
    taskFor(this.getDisplayColumnnForField).cancelAll();
    taskFor(this.setDisplayRows).cancelAll();
    taskFor(this.setAddressFormat).cancelAll();
  }

  @action
  countryCodeChanged(value?: string) {
    if (!this.value) {
      return;
    }

    this.cancelAllTasks();

    this.value.clearExceptAddressLines();
    this.value.countryCode = value;
    taskFor(this.setAddressFormat).perform();
    this.removeAddressErrors();

    if (this.args.options?.countryChanged) {
      this.args.options.countryChanged(value);
    }
  }

  @action
  addressFieldChanged(
    field:
      | "countryCode"
      | "administrativeArea"
      | "locality"
      | "dependentLocality"
      | "postalCode"
      | "sortingCode"
      | "addressLine1"
      | "addressLine2",
    value: any
  ) {
    if (!this.value) {
      return;
    }

    this.value[field] = value;
    this.resetValues(field);
    this.reRenderRows(field);
    this.removeAddressErrors();
  }
}
