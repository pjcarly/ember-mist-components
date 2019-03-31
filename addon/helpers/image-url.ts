import Helper from '@ember/component/helper';
import Image from 'ember-mist-components/interfaces/image';

export default class ImageURLHelper extends Helper {
  compute([value, style]: [Image|undefined, string]) : string | undefined {
    if(!value) {
      return;
    }

    if(!value.url) {
      return;
    }

    if(style) {
      if(value.url.includes('?')) {
        return `${value.url}&style=${style}`;
      } else {
        return `${value.url}?style=${style}`;
      }
    } else {
      return value.url;
    }
  }
}
