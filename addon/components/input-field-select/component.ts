import InputFieldSelectComponent, {
  InputFieldSelectArguments,
} from '@getflights/ember-field-components/components/input-field-select/component';
import DynamicSelectOptionService from '@getflights/ember-mist-components/services/dynamic-select-options';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import SelectOption from '@getflights/ember-field-components/interfaces/SelectOption';
import { isArray } from '@ember/array';

export default class DynamicInputFieldSelectComponent extends InputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  _selectOptions!: SelectOption[];

  get selectOptionsComputed(): SelectOption[] {
    return this.getAllowedSelectOptions(this._selectOptions);
  }

  constructor(owner: any, args: InputFieldSelectArguments) {
    super(owner, args);
    taskFor(this.loadSelectOptions).perform();
  }

  @dropTask
  async loadSelectOptions() {
    const fieldOptions = this.fieldOptions;

    if (this.selectOptions) {
      this._selectOptions = this.selectOptions;
    } else if (this.args.options?.selectOptions) {
      this._selectOptions = this.args.options.selectOptions;
    } else if (
      fieldOptions &&
      fieldOptions.hasOwnProperty('selectOptions') &&
      isArray(fieldOptions.selectOptions)
    ) {
      this._selectOptions = fieldOptions.selectOptions;
    }

    // If selectOptions were defined, we dont load anything
    if (
      (!this._selectOptions || this._selectOptions.length === 0) &&
      this.widgetName !== 'country-select'
    ) {
      const selectOptions = await taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.args.field);

      this._selectOptions = selectOptions;
    }
  }

  @dropTask
  async reloadSelectOptions() {
    this.dynamicSelectOptions.removeSelectOptions(
      <string>this.modelName,
      this.args.field
    );
    taskFor(this.loadSelectOptions).perform();
  }
}
