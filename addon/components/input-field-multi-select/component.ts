import InputFieldMultiSelectComponent from "@getflights/ember-field-components/components/input-field-multi-select/component";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-concurrency-ts";
import { InputFieldArguments } from "@getflights/ember-field-components/addon/components/input-field/component";

export default class DynamicInputFieldMultiSelectComponent extends InputFieldMultiSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  constructor(owner: any, args: InputFieldArguments) {
    super(owner, args);
    taskFor(this.loadSelectOptions).perform();
  }

  @task
  async loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      (!this.selectOptions || this.selectOptions.length === 0) &&
      this.widgetName !== "country-select"
    ) {
      const selectOptions = await taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.args.field);

      this.selectOptions = selectOptions;
    }
  }
}
