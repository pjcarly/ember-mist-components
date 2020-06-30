import BaseInput from "ember-field-components/components/BaseInput";
import File from "ember-file-upload/file";
import { isEmpty } from "@ember/utils";
import { action } from "@ember/object";
import { computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";

export default class InputFileComponent extends BaseInput {
  type = "file";
  multiple: boolean = false;

  @computed("inputId")
  get inputIdComputed() {
    return this.inputId ?? `${guidFor(this)}-queue`;
  }

  @action
  filesSelected(file: File) {
    if (!isEmpty(file)) {
      this.set("computedValue", file);
    }
  }
}
