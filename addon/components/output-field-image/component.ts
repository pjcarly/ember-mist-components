import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { computed, action } from "@ember/object";

export default class OutputFieldImageComponent extends OutputFieldComponent {
  imageClicked(_: Image) {}

  @computed("options", "options.style")
  get style(): string {
    return this.options ? this.options.style : "";
  }

  @action
  didClickImage(image: Image) {
    this.imageClicked(image);
  }
}
