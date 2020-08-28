import BaseOutput from "@getflights/ember-field-components/components/BaseOutput";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { action } from "@ember/object";

export default class OutputImageComponent extends BaseOutput {
  type = "image";

  imageClicked(_: Image) {}

  @action
  didClickImage(image: Image) {
    this.imageClicked(image);
  }
}
