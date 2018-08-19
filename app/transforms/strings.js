import Ember from 'ember';
import DS from 'ember-data';

const { Transform } = DS;
const { A } = Ember;

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
