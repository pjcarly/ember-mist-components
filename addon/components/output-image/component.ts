import BaseOutput from "ember-field-components/components/BaseOutput";
import Image from "ember-mist-components/interfaces/image";

export default class OutputImageComponent extends BaseOutput {
  type = 'image';

  imageClicked(_ : Image) {}

  didClickImage(image: Image) {
    this.imageClicked(image);
  }
}
