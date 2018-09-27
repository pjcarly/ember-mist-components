import Helper from '@ember/component/helper';
import { isBlank } from '@ember/utils';

export default Helper.extend({
  compute([value, style]){
    if(!isBlank(value) && !isBlank(value.url)) {
      if(isBlank(style)) {
        return value.url;
      } else {
        if(value.url.includes('?')) {
          return `${value.url}&style=${style}`;
        } else {
          return `${value.url}?style=${style}`;
        }
      }
    }
  }
});
