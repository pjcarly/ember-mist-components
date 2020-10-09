import { computed } from "@ember/object";
import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import AutonumberService, {
  AutonumberFieldOptions,
} from "@getflights/ember-mist-components/services/autonumber";
import { inject as service } from "@ember/service";

export default class OutputFieldAutonumberComponent extends OutputFieldComponent {
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
