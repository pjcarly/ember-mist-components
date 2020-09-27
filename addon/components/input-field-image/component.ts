import InputFieldFileComponent from "../input-field-file/component";
import { isBlank } from "@ember/utils";
import { computed } from "@ember/object";

export default class InputFieldImageComponent extends InputFieldFileComponent {
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
}
