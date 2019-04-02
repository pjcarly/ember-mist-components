import InputFieldMultiSelectComponent from 'ember-field-components/components/input-field-multi-select/component';
import SelectOption from 'ember-field-components/interfaces/SelectOption';
import DynamicSelectOptionService from 'ember-mist-components/services/dynamic-select-options';
import { inject as service } from "@ember-decorators/service";
import { task } from 'ember-concurrency-decorators';

export default class DynamicInputFieldMultiSelectComponent extends InputFieldMultiSelectComponent {
  @service dynamicSelectOptions !: DynamicSelectOptionService;

  cachedSelectOptions ?: SelectOption[] = [];

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.loadSelectOptions.perform();
  }

  @task
  * loadSelectOptions() {
    // If selectOptions were defined, we dont load anything
    if((!this.selectOptions || this.selectOptions.length === 0) && this.widgetName !== 'country-select') {
      const selectOptions = yield this.dynamicSelectOptions.getSelectOptions.perform(this.modelName, this.field);

      this.set('cachedSelectOptions', selectOptions);
    }
  }
}
