import BaseInput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseInput";
import File from "ember-file-upload/file";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";

export interface FileArguments extends Arguments {
  multiple?: boolean;
  /**
   * HTML attribute accept: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
   */
  accept?: string;
}

export default class InputFileComponent extends BaseInput<FileArguments> {
  type = "file";

  get inputIdComputed(): string {
    return this.args.inputId ?? `${guidFor(this)}-queue`;
  }

  @action
  filesSelected(file?: File) {
    this.setNewValue(file);
  }
}
