import InputFieldFileComponent from "../input-field-file/component";
import { isBlank } from "@ember/utils";
import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";

export interface InputFieldImageArguments extends InputFieldArguments {
  options?: InputFieldImageOptionsArgument;
}

export interface InputFieldImageOptionsArgument {
  endpoint?: string;
}

export default class InputFieldImageComponent extends InputFieldFileComponent {
  get modifiedOptions() {
    let options = this.args.options;

    if (isBlank(options)) {
      options = {};
    }

    if (!options.endpoint) {
      options.endpoint = "image/images";
    }

    return options;
  }
}
