import FieldInformationService from "ember-field-components/services/field-information";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isArray } from "@ember/array";
import BaseInput from "ember-field-components/components/BaseInput";
import { Row } from "../model-table/component";
import { guidFor } from "@ember/object/internals";
import Condition from "ember-mist-components/query/Condition";

export default class InputLookupWindowComponent extends BaseInput {
  @service intl!: any;
  @service fieldInformation!: FieldInformationService;

  type = "lookup-window";
  modelName!: string | string[];
  modalVisible: boolean = false;
  conditions: Condition[] = [];

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

  @computed
  get modalId(): string {
    return `${guidFor(this)}-modal`;
  }

  @action
  showModal() {
    this.set("modalVisible", true);
    $(`#${this.modalId}`).modal("show");
  }

  @action
  closeModal() {
    this.set("modalVisible", false);
    $(`#${this.modalId}`).modal("hide");
  }

  @action
  clearLookup() {
    this.set("computedValue", null);
  }

  @action
  didSelectRow(row: Row) {
    this.closeModal();
    this.set("computedValue", row.content);
  }
}
