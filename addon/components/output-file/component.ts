import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";
import File from "@getflights/ember-mist-components/interfaces/file";

export interface FileArguments extends Arguments {
  value?: File;
}

export default class OutputFileComponent extends BaseOutput<FileArguments> {
  type = "file";
}
