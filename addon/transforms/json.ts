import Transform from "@ember-data/serializer/transform";

export default class JsonTransform extends Transform {
  deserialize(serialized: any) {
    return serialized;
  }

  serialize(deserialized: any) {
    return deserialized;
  }
}
