import Transform from "@ember-data/serializer/transform";
import { isArray } from "@ember/array";
import { isBlank } from "@ember/utils";
import File from "../interfaces/file";

export default class FilesTransform extends Transform {
  deserialize(serialized: File[] | undefined | null) {
    return serialized ? serialized : [];
  }

  serialize(deserialized: File[] | undefined | null) {
    if (!isBlank(deserialized) && isArray(deserialized)) {
      return deserialized;
    } else {
      return [];
    }
  }
}
