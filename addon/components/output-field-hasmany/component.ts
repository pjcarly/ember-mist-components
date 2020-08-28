import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import { FieldOptionsInterface } from "@getflights/ember-field-components/services/field-information";

export interface HasManyFieldOptions extends FieldOptionsInterface {
  polymorphic: boolean;
  filters: any[];
}

export default class OutputFieldHasmanyComponent extends OutputFieldComponent {
  @computed("fieldOptions")
  get isPolymorphic(): boolean {
    const options = <HasManyFieldOptions>this.fieldOptions;
    return (
      !isBlank(options) &&
      options.hasOwnProperty("polymorphic") &&
      options.polymorphic
    );
  }
}
