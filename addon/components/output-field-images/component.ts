import OutputFieldComponent from "@getflights/ember-field-components/components/output-field/component";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { computed, action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { OutputFieldImageArguments } from "../output-field-image/component";
import Carousel from "bootstrap.native/dist/components/carousel-native.esm.js";

export default class OutputFieldImagesComponent extends OutputFieldComponent<
  OutputFieldImageArguments
> {
  carousel!: Carousel;

  @computed()
  get carouselName(): string {
    return guidFor(this) + "-carousel";
  }

  @action
  initializeCarousel(element: HTMLElement) {
    const carousel = new Carousel(element);
    this.carousel = carousel;
  }

  @action
  didClickImage(image: Image) {
    if (this.args.imageClicked) {
      this.args.imageClicked(image);
    }
  }
}
