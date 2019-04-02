import InputFieldImageComponent from '../input-field-image/component';
import { isBlank } from '@ember/utils';
import { computed, action } from '@ember-decorators/object';
import { guidFor } from '@ember/object/internals';
import Image from 'ember-mist-components/interfaces/image';

export default class InputFieldImagesComponent extends InputFieldImageComponent {
  @computed
  get carouselName() : string {
    return `${guidFor(this)}-carousel`;
  }

  @action
  didChangeValue(changedIndex: number, changedValue: any){
    const oldValues = <Image[]> this.value;
    const newValues : Image[] = [];

    oldValues.forEach((value: Image, index: number) => {
      if(index === changedIndex) {
        if(isBlank(changedValue)) {
          // Can only be used if value must be deleted, if a value is added, it is an array, and added to the end
          value = changedValue;
        }
      }

      if(!isBlank(value) && value.hasOwnProperty('id') && value.id) {
        newValues.push(value);
      }
    });

    if(isBlank(changedIndex) && !isBlank(changedValue) && changedValue.constructor === Array) {
      changedValue.forEach((newValue: Image) => {
        if(!isBlank(newValue) && newValue.hasOwnProperty('id') && newValue.id) {
          newValues.push(newValue);
        }
      })
    }

    this.set('value', newValues);
  }
}
