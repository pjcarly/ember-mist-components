import Transform from "@ember-data/serializer/transform";
import { isArray } from "@ember/array";
import { isBlank } from "@ember/utils";

export default class StringsTransform extends Transform {
  deserialize(serialized: string[] | undefined | null) {
    return serialized ?? [];
  }

  serialize(deserialized: string[] | undefined | null) {
    if (!isBlank(deserialized) && isArray(deserialized)) {
      return deserialized;
    } else {
      return [];
    }
  }
}
