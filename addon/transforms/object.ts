import Transform from "@ember-data/serializer/transform";
import { isEmpty, typeOf } from "@ember/utils";

/**
 * Needed by the model-change-tracker 
 */
export default class ObjectTransform extends Transform {
  deserialize(value: any) {
    if (isEmpty(value)) {
      return {};
    }
    if (typeOf(value) === <any>"object") {
      return value;
    }
    if (typeOf(value) === 'string') {
      return JSON.parse(value);
    }
  }

  serialize(value: any) {
    return value && JSON.stringify(value);;
  }
}
