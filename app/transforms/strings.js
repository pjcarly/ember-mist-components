import DS from 'ember-data';
import { A } from '@ember/array';
import { isBlank } from '@ember/utils';

const { Transform } = DS;

export default Transform.extend({
  deserialize: function(serialized) {
    serialized = A(serialized);
    return serialized;
  },
  serialize: function(deserialized) {
    if(!isBlank(deserialized)){
      deserialized = deserialized.toArray();
    }
    return deserialized;
  }
});
