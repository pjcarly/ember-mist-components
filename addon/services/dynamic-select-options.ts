import Service from "@ember/service";
import Store from 'ember-data/store';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from "@ember-decorators/service";
import { assert } from "@ember/debug";
import { dasherize, camelize } from "@ember/string";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import FieldModel from "ember-mist-components/models/field";
import { isBlank } from "@ember/utils";

export default class DynamicSelectOptionService extends Service {
  @service storage !: any;
  @service store !: Store;

  /**
   * Returns the SelectOptions for the provided model and field.
   *  - First we check the local cache, and see if the selectOptions are present
   *  - Then we check the store, perhaps the meta model was already loaded
   *  - If nothing was found, we query the meta endpoint and fetch the selectOptions
   * @param modelName The name of the model
   * @param field The name of the field
   */
  @task
  * getSelectOptions(modelName: string, field: string) {
    let cachedSelectOptions : SelectOption[] = [];

    const id = `${modelName}.${dasherize(field)}`;

    const fieldAdapter = this.store.adapterFor('field');
    assert(`Dynamic select options not enabled for model: ${modelName} and field: ${field}. Did you forget to create the Field model, or include selectOptions on your field?`, !isBlank(fieldAdapter));

    // first we check if the local storage has the values cached
    const localKey = camelize(`selectoptions_${id}`);
    const localSelectOptions = <SelectOption[]> this.storage.get(localKey);

    if(!isBlank(localSelectOptions)) {
      cachedSelectOptions = localSelectOptions;
    } else if(this.store.hasRecordForId('field', id)) {
      // next we check if we haven't already loaded the selectOptions
      const fieldModel = <FieldModel> this.store.peekRecord('field', id);
      cachedSelectOptions = this.transformFieldSelectOptionsToSelectOptions(fieldModel);
    } else {
      // not yet loaded, let's do a callout
      yield this.store.loadRecord('field', id).then((fieldModel: FieldModel) => {
        cachedSelectOptions = this.transformFieldSelectOptionsToSelectOptions(fieldModel);
      });
    }

    if(!isBlank(cachedSelectOptions) && isBlank(localSelectOptions)) {
      this.storage.set(localKey, cachedSelectOptions);
    }

    return cachedSelectOptions;
  }

  /**
   * This transforms the meta FieldModel to the SelectOptions that can be used in ember-field-components select components
   * @param fieldModel The field model
   */
  transformFieldSelectOptionsToSelectOptions(fieldModel: FieldModel) : SelectOption[] {
    const transformedSelectOptions : SelectOption[] = [];

    if(fieldModel.selectOptions) {
      for (const key in fieldModel.selectOptions) {
        const selectOption : SelectOption = {
          value: key,
          label: fieldModel.selectOptions[key]
        }

        transformedSelectOptions.push(selectOption);
      }
    }

    return transformedSelectOptions;
  }
}
