import Helper from '@ember/component/helper';
import Image from 'ember-mist-components/interfaces/image';
import { htmlSafe } from '@ember/template';

export default class ImageURLHelper extends Helper {
  compute([value, style]: [Image|undefined, string]) : string | undefined {
    if(!value) {
      return;
    }

    if(!value.url) {
      return;
    }

    let returnValue = '';

    if(style) {
      if(value.url.includes('?')) {
        returnValue = `${value.url}&style=${style}`;
      } else {
        returnValue = `${value.url}?style=${style}`;
      }
    } else {
      returnValue = value.url;
    }

    return htmlSafe(returnValue);
  }
}
