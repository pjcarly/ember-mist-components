import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isArray } from "@ember/array";
import BaseInput from "@getflights/ember-field-components/components/BaseInput";
import { Row } from "../model-table/component";
import Query from "@getflights/ember-mist-components/query/Query";
import { YieldedComponent as ModalComponent } from "@getflights/ember-mist-components/components/modal/component";

export default class InputLookupWindowComponent extends BaseInput {
  @service intl!: any;
  @service fieldInformation!: FieldInformationService;

  type = "lookup-window";
  modelName!: string | string[];
  modalVisible: boolean = false;
  baseQuery?: Query;

  @computed("value", "modelName")
  get activeModelName(): string {
    // needed for polymorphic relationships
    if (isArray(this.modelName)) {
      if (this.value) {
        return this.fieldInformation.getModelName(this.value);
      } else {
        return this.modelName[0];
      }
    } else {
      return this.modelName;
    }
  }

  @action
  clearLookup() {
    this.set("computedValue", null);
  }

  @action
  didSelectRow(modal: ModalComponent, row: Row) {
    modal.close();
    this.set("computedValue", row.content);
  }
}
