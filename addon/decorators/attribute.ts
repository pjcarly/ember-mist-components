import Model, { attr } from "@ember-data/model";
import { getOwner } from "@ember/application";
import FieldInformationService from "@getflights/ember-field-components/addon/services/field-information";
// @ts-ignore
import { fragment } from "ember-data-model-fragments/attributes";

export function field(type: string, options?: any) {
  if (type === "address") {
    return fragment(...arguments);
  } else {
    if (type === "currency") {
      if (!options) {
        options = {};
      }

      options.defaultValue = (model: Model) => {
        const fieldInformation: FieldInformationService = getOwner(
          model
        ).lookup("service:field-information");
        return fieldInformation.defaultCurrency;
      };
    }

    return attr(type, options);
  }
}
