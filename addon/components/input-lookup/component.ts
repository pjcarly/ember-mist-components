import BaseInput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseInput";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import { inject as service } from "@ember/service";
import { isArray } from "@ember/array";
import { action } from "@ember/object";
import Query from "@getflights/ember-mist-components/query/Query";

export interface LookupArguments extends Arguments {
  /**
   * The name of the model, this can either be 1 or multiple
   */
  modelName: string | string[];
  baseQuery?: Query;
}

export default class InputLookup extends BaseInput<LookupArguments> {
  @service intl!: any;
  @service fieldInformation!: FieldInformationService;

  type = "lookup";
  inputGroup: boolean = true;

  get activeModelName(): string {
    // needed for polymorphic relationships
    if (isArray(this.args.modelName)) {
      if (this.args.value) {
        return this.fieldInformation.getModelName(this.args.value);
      } else {
        return this.args.modelName[0];
      }
    } else {
      return this.args.modelName;
    }
  }

  get modelTitle(): string {
    return this.fieldInformation.getTranslatedPlural(this.activeModelName);
  }

  @action
  clearLookup() {
    this.valueChanged(null);
  }
}
