import BaseInput from "ember-field-components/components/BaseInput";
import { isEmpty } from "@ember/utils";
import { action } from "@ember/object";
import File from "ember-file-upload/file";

export default class InputFileComponent extends BaseInput {
  type = "file";
  multiple: boolean = false;

  @action
  filesSelected(file: File) {
    if (!isEmpty(file)) {
      this.set("computedValue", file);
    }
  }
}
