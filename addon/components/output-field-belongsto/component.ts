import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import OutputFieldComponent from "ember-field-components/components/output-field/component";
import { inject as service } from "@ember/service";
import FieldInformationService from "ember-field-components/services/field-information";
import { FieldOptionsInterface } from "ember-field-components/services/field-information";

export interface BelongsToFieldOptions extends FieldOptionsInterface {
  polymorphic: boolean;
  filters: any[];
}

export default class OutputFieldBelongstoComponent extends OutputFieldComponent {
  @service fieldInformation!: FieldInformationService;

  @computed("model", "field")
  get relationshipModelName(): string | string[] {
    if (this.isPolymorphic) {
      return this.fieldInformation.getBelongsToModelNames(
        this.modelName,
        this.field
      );
    }

    return this.fieldInformation.getBelongsToModelName(
      this.modelName,
      this.field
    );
  }

  /**
   * Returns a component name for a dynamic component based on the type of relationship (for example you might want to customize all input fields of users differently than normal)
   */
  @computed("relationshipModelName")
  get dynamicComponentName(): string {
    return `output-belongsto-${this.relationshipModelName}`;
  }

  @computed("fieldOptions")
  get isPolymorphic(): boolean {
    const options = <BelongsToFieldOptions>this.fieldOptions;
    return (
      !isBlank(options) &&
      options.hasOwnProperty("polymorphic") &&
      options.polymorphic
    );
  }

  @computed("value")
  get relationshipId(): string | undefined {
    if (this.value) {
      return this.value.id;
    }

    return;
  }

  @computed("value")
  get route(): string | undefined {
    return this.value
      ? `${this.fieldInformation.getModelName(this.value)}.view`
      : undefined;
  }
}
