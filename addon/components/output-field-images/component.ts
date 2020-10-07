import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { computed, action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";

export default class OutputFieldImagesComponent extends OutputFieldComponent {
  imageClicked(_: Image) {}
  carousel!: bsn.Carousel;

  didInsertElement() {
    // @ts-ignore
    super.didInsertElement(...arguments);
    const element = document.getElementById(this.carouselName);
    if (element) {
      const carousel = new bsn.Carousel(element);
      this.set("carousel", carousel);
    }
  }

  @computed()
  get carouselName(): string {
    return guidFor(this) + "-carousel";
  }

  @action
  didClickImage(image: Image) {
    this.imageClicked(image);
  }
}
