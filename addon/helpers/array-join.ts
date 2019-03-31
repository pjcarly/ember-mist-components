import Helper from '@ember/component/helper';
import { isBlank } from '@ember/utils';

export default class ArrayJoinHelper extends Helper {
  compute([array, delimiter] : [string[], string|undefined]){
    delimiter = isBlank(delimiter) ? ', ' : delimiter;
    return array.join(delimiter);
  }
}
