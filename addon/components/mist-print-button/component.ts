/* global window */
import Component from "@ember/component";
import { computed, action } from "@ember/object";
import { isBlank } from "@ember/utils";
import { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import Store from "@ember-data/store";
import { dropTask } from "ember-concurrency-decorators";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { tagName } from "@ember-decorators/component";
import { guidFor } from "@ember/object/internals";
import $ from "jquery";
import { taskFor } from "ember-concurrency-ts";
import { alias } from "@ember/object/computed";

@tagName("")
export default class MistPrintButtonComponent extends Component {
  @service store!: Store;

  value!: string; // PDF Template
  model!: DrupalModel; // Financial Document Model
  grouping?: string;
  selectOptions!: SelectOption[];
  modalVisible: boolean = false;
  language?: string;

  @computed()
  get modalId(): string {
    return `${guidFor(this)}-modal`;
  }

  @computed()
  get config() {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @alias("config.apiEndpoint")
  apiEndpoint!: string;

  @computed("value")
  get template(): any {
    return this.store.peekRecord("pdf", this.value);
  }

  @dropTask
  *generatePdf() {
    let digest = null;

    yield this.template
      .generateDigest({ id: this.model.get("id") })
      .then((result: Response) => {
        return result.json().then((jsonBody) => {
          digest = jsonBody.digest;
        });
      });

    window.open(
      `${this.apiEndpoint}template/generate/${this.template.key}?id=${
        this.model.id
      }&digest=${digest}${
        !isBlank(this.language) ? `&lang=${this.language}` : ""
      }`,
      "_blank"
    );
  }

  @dropTask
  *fetchTemplates() {
    let pdfResults: DrupalModel[] = [];
    yield this.store
      .query("pdf", {
        filter: {
          1: {
            field: "grouping",
            value: this.grouping,
          },
        },
      })
      .then((results: any) => {
        pdfResults = results;
      });

    let selectOptions: SelectOption[] = [];
    let value: string | null = null;
    pdfResults.forEach((pdfResult) => {
      if (isBlank(value)) {
        value = pdfResult.get("id");
      }

      let selectOption: SelectOption = {
        value: pdfResult.id,
        // @ts-ignore
        label: pdfResult.name,
      };

      selectOptions.push(selectOption);
    });

    this.set("value", value);
    this.set("selectOptions", selectOptions);
  }

  @action
  showModal() {
    // @ts-ignore
    $(`#${this.modalId}`).modal("show");
    taskFor(this.fetchTemplates).perform();
    this.set("modalVisible", true);
  }

  @action
  closeModal() {
    // @ts-ignore
    $(`#${this.modalId}`).modal("hide");
    this.set("modalVisible", false);
  }

  @action
  templateValueChanged(value: string) {
    this.set("value", value);
  }
}
