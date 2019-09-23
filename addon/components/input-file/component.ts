import BaseInput from "ember-field-components/components/BaseInput";
import { isEmpty } from "@ember/utils";
import { action } from "@ember/object";

export default class InputFileComponent extends BaseInput {
  type = "file";

  multiple: boolean = false;

  @action
  filesSelected(event: any) {
    const input = event.target;
    if (!isEmpty(input.files)) {
      this.set("computedValue", input.files);
    }
  }
}
