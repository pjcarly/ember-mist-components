import InputFieldSelectComponent from "ember-field-components/components/input-field-select/component";
import DynamicSelectOptionService from "ember-mist-components/services/dynamic-select-options";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";

export default class DynamicInputFieldSelectComponent extends InputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  cachedSelectOptions?: SelectOption[] = [];

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.loadSelectOptions.perform();
  }

  @task
  *loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if (
      !this.selectOptions &&
      this.widgetName !== "country-select" &&
      !(this.fieldOptions && this.fieldOptions.selectOptions)
    ) {
      const selectOptions = yield this.dynamicSelectOptions.getSelectOptions.perform(
        this.modelName,
        this.field
      );

      this.set("selectOptions", this.getAllowedSelectOptions(selectOptions));
    }
  }
}
