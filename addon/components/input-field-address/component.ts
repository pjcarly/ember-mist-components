import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
import Address from "@getflights/ember-mist-components/models/address";
import AddressService from "@getflights/ember-mist-components/services/address";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { task, taskGroup } from "ember-concurrency-decorators";
import { isBlank } from "@ember/utils";
import { isNone } from "@ember/utils";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { taskFor } from "ember-concurrency-ts";
import { tracked } from "@glimmer/tracking";

export default class InputFieldAddressComponent extends InputFieldComponent<
  InputFieldArguments
> {
  // @ts-ignore
  @service("address") addressing!: AddressService;

  @taskGroup addressLoading!: any;
  @tracked displayRows: any[] = [];

  constructor(owner: any, args: InputFieldArguments) {
    super(owner, args);
    taskFor(this.setAddressFormat).perform();
  }

  get address(): Address {
    const model = this.args.model;
    let address = model
      // @ts-ignore
      .get(this.args.field);

    if (!address) {
      // @ts-ignore
      address = this.store.createFragment("address", {});
      // @ts-ignore
      model.set(this.field, address);
    }

    // @ts-ignore
    return address;
  }

  @task({ group: "addressLoading" })
  async setAddressFormat() {
    const countryCode = this.address.countryCode;

    if (!countryCode) {
      if (!this.address.isBlankModel) {
        // no country code is chosen, the address must be cleared
        this.address.clear();
        // @ts-ignore
        this.address.set("format", null);
        // @ts-ignore
        this.address.notifyPropertyChange("format");
      }
    } else {
      if (
        !this.address.format ||
        this.address.format.data.id !== this.address.countryCode
      ) {
        const format = await taskFor(this.addressing.getAddressFormat).perform(
          countryCode
        );
        // @ts-ignore
        this.address.set("format", format);
      }
    }

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
    const addressFormat = this.address.format;
    const rows = [];

    if (
      !isBlank(addressFormat) &&
      !isBlank(addressFormat.data.attributes.format)
    ) {
      const format = addressFormat.data.attributes.format;

      let rawStructurePerLine = format.split("\n");

      for (let rawLine of rawStructurePerLine) {
        let rawColumns = rawLine.split("%");
        let row: any = {};
        row.columns = [];

        for (let rawColumn of rawColumns) {
          rawColumn = rawColumn.replace(/[^0-9a-z]/gi, ""); // we remove all none alpha numeric characters
          if (!isBlank(rawColumn)) {
            let column = await taskFor(this.getDisplayColumnnForField).perform(
              rawColumn,
              addressFormat
            );
            if (!isBlank(column)) {
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
  async getDisplayColumnnForField(field: string, format: any) {
    if (
      field !== "familyName" &&
      field !== "givenName" &&
      field !== "organization" &&
      field !== "additionalName"
    ) {
      const selectlistDepth = format.data.attributes["subdivision-depth"];
      const requiredFields = format.data.attributes["required-fields"];

      let column: any = {};
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
        column.component = "input-text";
      } else {
        // We have a depth, meaning there are select options available, so now we must figure out:
        // - if this field is a select field or a plain text field
        // - and if it is a select field, find out if we can display it (if a parent value is filled in)
        //   for example: you can't know the cities, if you don't know the province of the address

        const usedFields = format.data.attributes["used-fields"]; // this is an array, containing the used fields in the format, sorted from big to small
        const positionOfField = usedFields.indexOf(field) + 1; // 0-based

        if (positionOfField > selectlistDepth) {
          // the position is larger than the depth, this is a plain text field
          column.component = "input-text";
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
            isDisabled = isBlank(this.address.get(parentField));
          }

          // this is the top most field, we don't need to mind parent values

          if (!isDisabled) {
            // @ts-ignore
            let subdivisionSelectOptions = this.get(`${field}SelectOptions`);

            if (isNone(subdivisionSelectOptions)) {
              const parentGrouping = this.getParentGroupingForField(field);
              subdivisionSelectOptions = await taskFor(
                this.getSubdivisionSelectOptions
              ).perform(parentGrouping);
            }

            if (isBlank(subdivisionSelectOptions)) {
              // no select options found, this is just a plain text field
              column.component = "input-text";
            } else {
              column.none = `-- ${column.label} --`;
              column.component = "input-select";
              column.selectOptions = subdivisionSelectOptions;
              column.disabled = isDisabled;
            }
          } else {
            // a disabled field, lets only display 1 option, as they will be rerendered anyway
            column.none = `-- ${column.label} --`;
            column.component = "input-select";
            column.selectOptions = [];
            column.disabled = isDisabled;
          }
        }
      }

      return column;
    }
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
    const format = this.address.format;
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
    const addressFormat = this.address.get("format");
    const selectlistDepth = addressFormat.data.attributes["subdivision-depth"];

    if (selectlistDepth !== 0) {
      // only need to be reset if there are potential dependent address fields
      const usedFields = addressFormat.data.attributes["used-fields"]; // this is an array, containing the used fields in the format, sorted from big to small
      const zeroBasedPositionOfField = usedFields.indexOf(editedField);

      if (zeroBasedPositionOfField + 1 < selectlistDepth) {
        for (let i = zeroBasedPositionOfField + 1; i < selectlistDepth; i++) {
          // @ts-ignore
          this.address.set(usedFields[i], null);
        }
      }
    }
  }

  getParentGroupingForField(field: string): string {
    const address = this.address;
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
  countryCodeChanged(value: string) {
    this.address.clearExceptAddressLines();
    this.cancelAllTasks();
    // @ts-ignore
    this.address.set("countryCode", value);
    taskFor(this.setAddressFormat).perform();
    this.removeAddressErrors();
  }

  @action
  addressFieldChanged(field: string, value: any) {
    // @ts-ignore
    this.address.set(field, value);
    this.resetValues(field);
    this.reRenderRows(field);
    this.removeAddressErrors();
  }
}
