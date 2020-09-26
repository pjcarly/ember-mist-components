import Validator from "@getflights/ember-attribute-validations/validator";
import Model from "@ember-data/model";
import {
  hasValue,
  hasBelongsToValue,
} from "@getflights/ember-attribute-validations/utils";

export default class ConditionalRequiredValidator extends Validator {
  name = "conditionalRequired";

  validate(
    _: string,
    value: any,
    attribute: any,
    model: Model
  ): string | boolean {
    const requiredField = attribute.options.validation.conditionalRequired;

    if (attribute.isAttribute) {
      if (model.get(requiredField) && !hasValue(value)) {
        return this.format();
      }
    } else if (
      attribute.meta.isRelationship &&
      attribute.kind === "belongsTo"
    ) {
      if (model.get(requiredField) && !hasBelongsToValue(value)) {
        return this.format();
      }
    }

    return false;
  }
}
