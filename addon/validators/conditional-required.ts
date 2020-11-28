import Validator, {
  AttributeInterface,
  ValidatorOptions,
} from "@getflights/ember-attribute-validations/base-validator";
import Model from "@ember-data/model";
import {
  hasValue,
  hasBelongsToValue,
} from "@getflights/ember-attribute-validations/utils";
import { tracked } from "@glimmer/tracking";

export interface ConditionalRequiredValidatorOptions extends ValidatorOptions {
  conditionalRequired: string;
}

export default class ConditionalRequiredValidator extends Validator<ConditionalRequiredValidatorOptions> {
  name = "conditionalRequired";

  @tracked requiredField: string;

  constructor(
    attribute: AttributeInterface,
    options: ConditionalRequiredValidatorOptions
  ) {
    super(attribute, options);
    this.requiredField = options.conditionalRequired;
  }

  validate(value: any, model: Model): string | boolean {
    if (this.attribute.isAttribute) {
      // @ts-ignore
      if (model.get(this.requiredField) && !hasValue(value)) {
        return this.format();
      }
    } else if (
      this.attribute.meta?.isRelationship &&
      this.attribute.meta?.kind === "belongsTo"
    ) {
      // @ts-ignore
      if (model.get(this.requiredField) && !hasBelongsToValue(value)) {
        return this.format();
      }
    }

    return false;
  }
}
