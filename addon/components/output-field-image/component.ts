import OutputFieldComponent, {
  OutputFieldArguments,
  OutputFieldOptionsArgument,
} from "@getflights/ember-field-components/components/output-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { action } from "@ember/object";

export interface OutputFieldImageArguments extends OutputFieldArguments {
  options?: OutputFieldImageOptionsArgument;
  imageClicked?: (image: Image) => void;
}

export interface OutputFieldImageOptionsArgument
  extends OutputFieldOptionsArgument {
  style?: string;
}

export default class OutputFieldImageComponent extends OutputFieldComponent<
  OutputFieldImageArguments
> {
  get style(): string | undefined {
    return this.args.options ? this.args.options.style : "";
  }

  @action
  didClickImage(image: Image) {
    if (this.args.imageClicked) {
      this.args.imageClicked(image);
    }
  }
}
