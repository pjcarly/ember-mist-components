import BaseOutput from "@getflights/ember-field-components/components/BaseOutput";
import { ImageArguments } from "../output-image/component";

export default class OutputImageLinkComponent extends BaseOutput<
  ImageArguments
> {
  type = "image-link";
}
