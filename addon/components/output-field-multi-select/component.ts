import OutputFieldMultiSelectComponent from "ember-field-components/components/output-field-multi-select/component";
import DynamicSelectOptionService from "ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";

export default class DynamicOutputFieldMultiSelectComponent extends OutputFieldMultiSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  didReceiveAttrs() {
    super.didReceiveAttrs();
    taskFor(this.loadSelectOptions).perform();
  }

  @task
  *loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      (!this.selectOptions || this.selectOptions.length === 0) &&
      this.widgetName !== "country-select"
    ) {
      const selectOptions = yield taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.field);

      this.set("selectOptions", selectOptions);
    }
  }
}
