import OutputFieldSelectComponent from '@getflights/ember-field-components/components/output-field-select/component';
import DynamicSelectOptionService from '@getflights/ember-mist-components/services/dynamic-select-options';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import SelectOption from '@getflights/ember-field-components/interfaces/SelectOption';
import { OutputFieldArguments } from '@getflights/ember-field-components/components/output-field/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ToastService from '@getflights/ember-mist-components/services/toast';

export default class DynamicOutputFieldSelectComponent extends OutputFieldSelectComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;
  @service toast!: ToastService;
  @tracked _selectOptions!: SelectOption[];
  @tracked showButton: boolean = false;
  isInTable: boolean = false;

  get selectOptions(): SelectOption[] {
    return this._selectOptions;
  }

  constructor(owner: any, args: OutputFieldArguments) {
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
      this.widgetName !== 'country-select'
    ) {
      const selectOptions = await taskFor(
        this.dynamicSelectOptions.getSelectOptions
      ).perform(<string>this.modelName, this.args.field);

      this._selectOptions = selectOptions;
    }
  }

  @action
  async reloadSelectOptions() {
    //remove selectoptions from localstorage
    this.dynamicSelectOptions.removeSelectOptions(
      <string>this.modelName,
      this.args.field
    );

    //send request for reloading selectoptions
    const selectOptions = await taskFor(
      this.dynamicSelectOptions.getSelectOptions
    ).perform(<string>this.modelName, this.args.field);

    this._selectOptions = selectOptions;
    this.toast.success('Success', 'Reloaded ' + this.args.field);
  }

  @action
  async toggleButton() {
    if (!this.isInTable) {
      this.showButton = !this.showButton;
    }
  }

  @action
  async inTable(element: HTMLElement) {
    if (!!element.parentElement?.closest('td')) {
      this.isInTable = true;
    }
  }
}
