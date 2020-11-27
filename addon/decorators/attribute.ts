import { attr } from "@ember-data/model";
// @ts-ignore
import { fragment } from "ember-data-model-fragments/attributes";

export function field(type: string, _options?: any) {
  if (type === "address") {
    return fragment(...arguments);
  } else {
    return attr(...arguments);
  }
}
