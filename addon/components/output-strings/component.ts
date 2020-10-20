import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";

export interface StringsArguments extends Arguments {
  value?: string[];
}

export default class OutputStringsComponent extends BaseOutput<
  StringsArguments
> {
  type = "strings";
}
