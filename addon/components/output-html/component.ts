import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";
import { htmlSafe } from "@ember/string";
// @ts-ignore
import { SafeString } from "@ember/string/-private/handlebars";

export default class OutputHtmlComponent extends BaseOutput<Arguments> {
  type = "html";

  get html(): SafeString {
    return htmlSafe(this.args.value);
  }
}
