import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";
import File from "@getflights/ember-mist-components/interfaces/file";
import InputMultiFieldComponent from "../input-multi-field/component";

export default class InputFieldFilesComponent extends InputMultiFieldComponent<
  InputFieldArguments<(File | null)[]>,
  File
> {}
