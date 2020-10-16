/* global window */
import Component from "@glimmer/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import Store from "@ember-data/store";
import { dropTask } from "ember-concurrency-decorators";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { alias } from "@ember/object/computed";

interface Arguments {
  model: DrupalModel;
  template: DrupalModel;
  language?: string;
}

export default class TemplateGenerateButtonComponent extends Component<
  Arguments
> {
  @service store!: Store;

  @computed()
  get config() {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @alias("config.apiEndpoint")
  apiEndpoint!: string;

  @dropTask
  *generatePdf() {
    let digest = null;

    yield this.args.template
      // @ts-ignore
      .generateDigest({ id: this.model.id })
      .then((results: any) => {
        digest = results.digest;
      });

    window.open(
      // @ts-ignore
      `${this.apiEndpoint}template/generate/${this.template.key}?id=${
        this.args.model.id
      }&digest=${digest}${
        this.args.language ? `&lang=${this.args.language}` : ""
      }`,
      "_blank"
    );
  }
}
