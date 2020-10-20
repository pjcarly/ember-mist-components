import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { action } from "@ember/object";

export interface ImageArguments extends Arguments {
  value?: Image;
  /**
   * Back-end image style to use
   */
  style?: string;
  imageClicked?: (image: Image) => void;
}

export default class OutputImageComponent extends BaseOutput<ImageArguments> {
  type = "image";

  @action
  didClickImage(image: Image) {
    if (this.args.imageClicked) {
      this.args.imageClicked(image);
    }
  }
}
