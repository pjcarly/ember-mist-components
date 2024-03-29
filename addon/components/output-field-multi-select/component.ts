import OutputFieldMultiSelectComponent from "@getflights/ember-field-components/components/output-field-multi-select/component";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { task } from "ember-concurrency";
import { taskFor } from "ember-concurrency-ts";
import { OutputFieldArguments } from "@getflights/ember-field-components/components/output-field/component";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { tracked } from "@glimmer/tracking";

export default class DynamicOutputFieldMultiSelectComponent extends OutputFieldMultiSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  @tracked _selectOptions!: SelectOption[];

  get selectOptions(): SelectOption[] {
    return this._selectOptions;
  }

  constructor(owner: any, args: OutputFieldArguments) {
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

      this._selectOptions = selectOptions;
    }
  }
}
