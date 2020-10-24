import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { computed, action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import { OutputFieldImageArguments } from "../output-field-image/component";

export default class OutputFieldImagesComponent extends OutputFieldComponent<
  OutputFieldImageArguments
> {
  carousel!: bsn.Carousel;

  @computed()
  get carouselName(): string {
    return guidFor(this) + "-carousel";
  }

  @action
  initializeCarousel(element: HTMLElement) {
    const carousel = new bsn.Carousel(element);
    this.carousel = carousel;
  }

  @action
  didClickImage(image: Image) {
    if (this.args.imageClicked) {
      this.args.imageClicked(image);
    }
  }
}
