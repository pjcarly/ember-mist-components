import Transform from 'ember-data/transform';
import { A } from '@ember/array';
import { isBlank } from '@ember/utils';

export default class StringsTransform extends Transform {
  deserialize(serialized: any) {
    serialized = A(serialized);
    return serialized;
  }

  serialize(deserialized: any) {
    if(!isBlank(deserialized)) {
      deserialized = deserialized.toArray();
    }
    return deserialized;
  }
};
