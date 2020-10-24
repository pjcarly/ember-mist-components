import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import InputMultiFieldComponent from "../input-multi-field/component";

export default class InputFieldImagesComponent extends InputMultiFieldComponent<
  InputFieldArguments<(Image | null)[]>,
  Image
> {
  get inputOptions(): any {
    let options = super.inputOptions;

    if (!options) {
      options = {};
    }

    options.field = this.fieldComputed;
    options.modelName = this.modelName;
    options.multiple = true;

    return options;
  }
}
