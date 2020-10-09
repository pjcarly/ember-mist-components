import InputFieldComponent from "@getflights/ember-field-components/components/input-field/component";
import AutonumberService, {
  AutonumberFieldOptions,
} from "@getflights/ember-mist-components/services/autonumber";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";

export default class InputFieldAutonumberComponent extends InputFieldComponent {
  @service autonumber!: AutonumberService;

  @computed("value")
  get computedValue(): string {
    return this.autonumber.computeValue(
      this.model,
      this.field,
      <AutonumberFieldOptions>this.fieldOptions
    );
  }
}
