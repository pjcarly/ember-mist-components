import InputFieldSelectComponent from "ember-field-components/components/input-field-select/component";
import DynamicSelectOptionService from "ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";

export default class DynamicInputFieldSelectComponent extends InputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  didReceiveAttrs() {
    // @ts-ignore
    super.didReceiveAttrs(...arguments);
    taskFor(this.loadSelectOptions).perform();
  }

  @task
  *loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      !this.selectOptions &&
      this.widgetName !== "country-select" &&
      !(this.fieldOptions && this.fieldOptions.selectOptions)
    ) {
      const selectOptions = yield taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.field);

      this.set("selectOptions", this.getAllowedSelectOptions(selectOptions));
    }
  }
}
