import moment from "moment";
import { padStart, replaceAll } from "ember-field-components/classes/utils";
import { computed } from "@ember/object";
import OutputFieldComponent from "ember-field-components/components/output-field/component";
import { FieldOptionsInterface } from "ember-field-components/services/field-information";

export interface AutonumberFieldOptions extends FieldOptionsInterface {
  minLength: number;
  prefixPattern: string;
  dateField: string;
}

export default class OutputFieldAutonumberComponent extends OutputFieldComponent {
  @computed("value")
  get computedValue(): string {
    // @ts-ignore (Is a dynamic computed property)
    let value = this.value;

    const fieldOptions = <AutonumberFieldOptions>this.fieldOptions;

    if (fieldOptions.minLength && fieldOptions.minLength > 0) {
      value = padStart(value, fieldOptions.minLength);
    }

    let prefix = "";
    if (fieldOptions.prefixPattern) {
      // there is a prefix Pattern
      prefix = fieldOptions.prefixPattern;

      const dateField = fieldOptions.dateField
        ? fieldOptions.dateField
        : "created";

      // Next we check possible date values to replace
      // @ts-ignore
      const date = this.model.get(dateField);

      if (date) {
        const momentDate = moment(<string>date);
        prefix = replaceAll(prefix, "{{YYYY}}", momentDate.format("YYYY"));
        prefix = replaceAll(
          prefix,
          "{{YY}}",
          padStart(momentDate.format("YY"), 2)
        );
        prefix = replaceAll(
          prefix,
          "{{QQ}}",
          padStart(momentDate.format("Q"), 2)
        );
        prefix = replaceAll(
          prefix,
          "{{MM}}",
          padStart(momentDate.format("MM"), 2)
        );
        prefix = replaceAll(
          prefix,
          "{{DD}}",
          padStart(momentDate.format("DD"), 2)
        );
      }
    }

    return `${prefix}${value}`;
  }
}
