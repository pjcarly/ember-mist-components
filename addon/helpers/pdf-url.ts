import Helper from "@ember/component/helper";
import { getOwner } from "@ember/application";
import { cached } from "@glimmer/tracking";

export default class ImageURLHelper extends Helper {
  @cached
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  compute([template, id, digest, html = false]: [
    string,
    string,
    string,
    boolean
  ]): string | undefined {
    if (!template || !id || !digest) {
      return;
    }

    let returnURL = `${this.config.apiEndpoint}template/generate/${template}?id=${id}&digest=${digest}`;

    if (html) {
      returnURL = `${returnURL}&html`;
    }

    return returnURL;
  }
}
