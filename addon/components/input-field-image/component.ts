import InputFieldFileComponent from "../input-field-file/component";
import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";

export interface InputFieldImageArguments extends InputFieldArguments<Image> {
  options?: InputFieldImageOptionsArgument;
}

export interface InputFieldImageOptionsArgument {
  endpoint?: string;
}

export default class InputFieldImageComponent extends InputFieldFileComponent<
  InputFieldImageArguments,
  Image
> {
  get modifiedInputOptions() {
    let options = super.inputOptions;

    if (!options) {
      options = {};
    }

    if (!options.endpoint) {
      options.endpoint = "image/images";
    }

    return options;
  }
}
