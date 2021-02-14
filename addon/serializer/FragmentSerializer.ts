import JSONSerializer from "@ember-data/serializer/json";
import { dasherize } from "@ember/string";

export default class FragmentSerializer extends JSONSerializer {
  keyForAttribute(attr: string) {
    return dasherize(attr);
  }
}
