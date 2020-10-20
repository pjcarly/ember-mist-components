import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isArray } from "@ember/array";
import BaseInput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseInput";
import { Row } from "../model-table/component";
import Query from "@getflights/ember-mist-components/query/Query";
import { YieldedComponent as ModalComponent } from "@getflights/ember-mist-components/components/modal/component";
import Model from "@ember-data/model";

export interface LookupWindowArguments extends Arguments {
  /**
   * The passed in name of the model
   */
  modelName: string | string[];

  /**
   * Query that can be passed in to limit the results to
   */
  baseQuery?: Query;

  value?: Model;
}

export default class InputLookupWindowComponent extends BaseInput<
  LookupWindowArguments
> {
  @service intl!: any;
  @service fieldInformation!: FieldInformationService;

  type = "lookup-window";
  modalVisible: boolean = false;

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

  @action
  clearLookup() {
    if (this.args.valueChanged) {
      this.args.valueChanged(null);
    }
  }

  @action
  didSelectRow(modal: ModalComponent, row: Row) {
    modal.close();
    if (this.args.valueChanged) {
      this.args.valueChanged(row.content);
    }
  }
}
