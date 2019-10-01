import OutputFieldMultiSelectComponent from "ember-field-components/components/output-field-multi-select/component";
import DynamicSelectOptionService from "ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";

export default class DynamicOutputFieldMultiSelectComponent extends OutputFieldMultiSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.loadSelectOptions.perform();
  }

  @task
  *loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      (!this.selectOptions || this.selectOptions.length === 0) &&
      this.widgetName !== "country-select"
    ) {
      const selectOptions = yield this.dynamicSelectOptions.getSelectOptions.perform(
        this.modelName,
        this.field
      );

      this.set("selectOptions", selectOptions);
    }
  }
}
