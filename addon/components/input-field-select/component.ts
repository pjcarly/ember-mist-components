import InputFieldSelectComponent from "@getflights/ember-field-components/components/input-field-select/component";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-concurrency-ts";
import { InputFieldArguments } from "@getflights/ember-field-components/components/input-field/component";

export default class DynamicInputFieldSelectComponent extends InputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  constructor(owner: any, args: InputFieldArguments) {
    super(owner, args);
    taskFor(this.loadSelectOptions).perform();
  }

  @task
  async loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      !this.selectOptions &&
      this.widgetName !== "country-select" &&
      !(this.fieldOptions && this.fieldOptions.selectOptions)
    ) {
      const selectOptions = await taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.args.field);

      this.selectOptions = this.getAllowedSelectOptions(selectOptions);
    }
  }
}
