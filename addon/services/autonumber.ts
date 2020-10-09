import Model from "@ember-data/model";
import Service from "@ember/service";
import moment from "moment";
import {
  padStart,
  replaceAll,
} from "@getflights/ember-field-components/classes/utils";
import { FieldOptionsInterface } from "@getflights/ember-field-components/services/field-information";

export interface AutonumberFieldOptions extends FieldOptionsInterface {
  minLength: number;
  prefixPattern: string;
  dateField: string;
}

export default class AutonumberService extends Service {
  computeValue(
    model: Model,
    field: string,
    fieldOptions: AutonumberFieldOptions
  ): string {
    // @ts-ignore
    let value = <string>model.get(field);

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
      const date = <Date>model.get(dateField);

      if (date) {
        prefix = this.calculateAutonumberPattern(date, prefix);
      }
    }

    return `${prefix}${value}`;
  }

  calculateAutonumberPattern(date: Date, pattern: string): string {
    const momentDate = moment(date);
    pattern = replaceAll(pattern, "{{YYYY}}", momentDate.format("YYYY"));
    pattern = replaceAll(
      pattern,
      "{{YY}}",
      padStart(momentDate.format("YY"), 2)
    );
    pattern = replaceAll(
      pattern,
      "{{QQ}}",
      padStart(momentDate.format("Q"), 2)
    );
    pattern = replaceAll(
      pattern,
      "{{MM}}",
      padStart(momentDate.format("MM"), 2)
    );
    pattern = replaceAll(
      pattern,
      "{{DD}}",
      padStart(momentDate.format("DD"), 2)
    );
    return pattern;
  }
}
