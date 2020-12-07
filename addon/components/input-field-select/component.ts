import InputFieldSelectComponent, {
  InputFieldSelectArguments,
} from "@getflights/ember-field-components/components/input-field-select/component";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency-decorators";
import { taskFor } from "ember-concurrency-ts";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { tracked } from "@glimmer/tracking";

export default class DynamicInputFieldSelectComponent extends InputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  @tracked _selectOptions!: SelectOption[];

  get selectOptionsComputed(): SelectOption[] {
    return this._selectOptions;
  }

  constructor(owner: any, args: InputFieldSelectArguments) {
    super(owner, args);
    taskFor(this.loadSelectOptions).perform();
  }

  @task
  async loadSelectOptions() {
    const selectOptionsOption = super.selectOptions;

    if (selectOptionsOption) {
      this._selectOptions = selectOptionsOption;
    }

    // If selectOptions were defined, we dont load anything
    if (
      (!this.selectOptions || this.selectOptions.length === 0) &&
      this.widgetName !== "country-select"
    ) {
      const selectOptions = await taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.args.field);

      this._selectOptions = this.getAllowedSelectOptions(selectOptions);
    }
  }
}
