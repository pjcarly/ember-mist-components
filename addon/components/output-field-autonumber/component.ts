import OutputFieldComponent, {
  OutputFieldArguments,
} from "@getflights/ember-field-components/components/output-field/component";
import AutonumberService, {
  AutonumberFieldOptions,
} from "@getflights/ember-mist-components/services/autonumber";
import { inject as service } from "@ember/service";

export default class OutputFieldAutonumberComponent extends OutputFieldComponent<
  OutputFieldArguments
> {
  @service autonumber!: AutonumberService;

  get computedValue(): string {
    return this.autonumber.computeValue(
      this.args.model,
      this.args.field,
      <AutonumberFieldOptions>this.fieldOptions
    );
  }
}
