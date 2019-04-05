import BaseOutput from "ember-field-components/components/BaseOutput";
import Image from "ember-mist-components/interfaces/image";
import { action } from "@ember-decorators/object";

export default class OutputImageComponent extends BaseOutput {
  type = 'image';

  imageClicked(_ : Image) {}

  @action
  didClickImage(image: Image) {
    this.imageClicked(image);
  }
}
