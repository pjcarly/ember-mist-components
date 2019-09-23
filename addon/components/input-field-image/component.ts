import InputFieldFileComponent from "../input-field-file/component";
import { isBlank } from "@ember/utils";
import { computed, action } from "@ember/object";
import { guidFor } from "@ember/object/internals";

export default class InputFieldImageComponent extends InputFieldFileComponent {
  type = "image";

  modalVisible: boolean = false;

  @computed("options.endpoint")
  get modifiedOptions() {
    let options = this.options;

    if (isBlank(options)) {
      options = {};
    }

    if (!options.endpoint) {
      options.endpoint = "image/images";
    }

    return options;
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
}
