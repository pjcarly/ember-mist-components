/* global window */
import Component from "@ember/component";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import Store from "ember-data/store";
import { dropTask } from "ember-concurrency-decorators";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { tagName } from "@ember-decorators/component";

@tagName("")
export default class TemplateGenerateButtonComponent extends Component {
  @service store!: Store;

  model!: DrupalModel; // The model you want to generate the template with
  template!: DrupalModel; // The Template to generate
  language?: string;

  @computed()
  get config() {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @alias("config.apiEndpoint")
  apiEndpoint!: string;

  @dropTask
  *generatePdf() {
    let digest = null;

    yield this.template
      // @ts-ignore
      .generateDigest({ id: this.model.id })
      .then((results: any) => {
        digest = results.digest;
      });

    window.open(
      // @ts-ignore
      `${this.apiEndpoint}template/generate/${this.template.key}?id=${
        this.model.id
      }&digest=${digest}${
        !isBlank(this.language) ? `&lang=${this.language}` : ""
      }`,
      "_blank"
    );
  }
}
