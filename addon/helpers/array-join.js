import Ember from 'ember';

const { Helper } = Ember;
const { isBlank } = Ember;

export default Helper.extend({
  compute([array, delimiter]){
    delimiter = isBlank(delimiter) ? ', ' : delimiter;
    return array.join(delimiter);
  }
});
