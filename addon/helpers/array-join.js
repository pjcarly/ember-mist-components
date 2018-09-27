import Helper from '@ember/component/helper';
import { isBlank } from '@ember/utils';

export default Helper.extend({
  compute([array, delimiter]){
    delimiter = isBlank(delimiter) ? ', ' : delimiter;
    return array.join(delimiter);
  }
});
