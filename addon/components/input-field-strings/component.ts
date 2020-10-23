import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";
import InputMultiFieldComponent from "../input-multi-field/component";

export default class InputFieldStringsComponent extends InputMultiFieldComponent<
  InputFieldArguments<(string | null)[]>,
  string
> {}
