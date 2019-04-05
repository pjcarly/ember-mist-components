import OutputFieldComponent from 'ember-field-components/components/output-field/component';
import Image from 'ember-mist-components/interfaces/image';
import { computed, action } from '@ember-decorators/object';
import { guidFor } from '@ember/object/internals';

export default class OutputFieldImagesComponent extends OutputFieldComponent {
  imageClicked(_ : Image) {}

  @computed
  get carouselName() : string {
    return guidFor(this) + '-carousel';
  }

  @action
  didClickImage(image : Image) {
    this.imageClicked(image);
  }
}
