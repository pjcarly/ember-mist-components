import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
import File from "@getflights/ember-mist-components/interfaces/file";

export default class InputFieldFileComponent<
  T extends InputFieldArguments<T2>,
  T2 extends File
> extends InputFieldComponent<T, T2> {
  get inputOptions(): any {
    let options = super.inputOptions;

    if (!options) {
      options = {};
    }

    options.field = this.fieldComputed;
    options.modelName = this.modelName;
    options.multiple = false;

    return options;
  }
}
