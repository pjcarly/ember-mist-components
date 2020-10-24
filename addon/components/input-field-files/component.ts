import { action } from "@ember/object";
import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";
import File from "@getflights/ember-mist-components/interfaces/file";
import InputMultiFieldComponent from "../input-multi-field/component";

export default class InputFieldFilesComponent extends InputMultiFieldComponent<
  InputFieldArguments<(File | null)[]>,
  File
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

  @action
  addNewImage(file: File) {
    this.addNewItem();
    const newItemIndex = this._items.length - 1;
    this.itemChanged(newItemIndex, file);
  }
}
