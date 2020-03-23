import BaseOutput from "ember-field-components/components/BaseOutput";
import { computed } from "@ember/object";
import { htmlSafe } from "@ember/string";
// @ts-ignore
import { SafeString } from "@ember/string/-private/handlebars";

export default class OutputHtmlComponent extends BaseOutput {
  type = "html";

  @computed("value")
  get html(): SafeString {
    return htmlSafe(this.value);
  }
}
