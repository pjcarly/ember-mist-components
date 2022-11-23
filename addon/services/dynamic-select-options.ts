import Service from '@ember/service';
import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { dasherize, camelize } from '@ember/string';
import SelectOption from '@getflights/ember-field-components/interfaces/SelectOption';
import { isBlank } from '@ember/utils';
import Query from '@getflights/ember-mist-components/query/Query';
import StorageService from '@getflights/ember-mist-components/services/storage';
import FieldInterface from '../interfaces/field';
import { action } from '@ember/object';

export default class DynamicSelectOptionService extends Service {
  @service storage!: StorageService;
  @service store!: Store;

  /**
   * This array contains a list of modelnames that were already loaded as selectoptions.
   * And should then be present in the store, without having to do a new query
   */
  loadedModelNames: string[] = [];

  /**
   * Returns the SelectOptions for the provided model and field.
   *  - First we check the local cache, and see if the selectOptions are present
   *  - Then we check the store, perhaps the meta model was already loaded
   *  - If nothing was found, we query the meta endpoint and fetch the selectOptions
   * @param modelName The name of the model
   * @param field The name of the field
   */
  @task({ enqueue: true, maxConcurrency: 4 })
  async getSelectOptions(modelName: string, field: string) {
    let cachedSelectOptions: SelectOption[] = [];

    const id = `${modelName}.${dasherize(field)}`;
    // @ts-ignore
    const fieldAdapter = this.store.adapterFor('field');
    assert(
      `Dynamic select options not enabled for model: ${modelName} and field: ${field}. Did you forget to create the Field model, or include selectOptions on your field?`,
      !isBlank(fieldAdapter)
    );

    // first we check if the local storage has the values cached
    const localKey = camelize(`selectoptions_${id}`);
    const localSelectOptions = <SelectOption[]>this.storage.retrieve(localKey);

    if (!isBlank(localSelectOptions)) {
      cachedSelectOptions = localSelectOptions;
    } else if (this.store.hasRecordForId('field', id)) {
      // next we check if we haven't already loaded the selectOptions
      const fieldModel = <FieldInterface>this.store.peekRecord('field', id);
      cachedSelectOptions =
        this.transformFieldSelectOptionsToSelectOptions(fieldModel);
    } else {
      // not yet loaded, let's do a callout
      await this.store
        // @ts-ignore
        .loadRecord('field', id)
        .then((fieldModel: FieldInterface) => {
          cachedSelectOptions =
            this.transformFieldSelectOptionsToSelectOptions(fieldModel);
        });
    }

    if (!isBlank(cachedSelectOptions) && isBlank(localSelectOptions)) {
      this.storage.persist(localKey, cachedSelectOptions);
    }

    return cachedSelectOptions;
  }

  @action
  async removeSelectOptions(modelName: string, field: string) {
    const id = `${modelName}.${dasherize(field)}`;
    const localKey = camelize(`selectoptions_${id}`);
    this.storage.remove(localKey);
  }

  /**
   * This function returns Models as select options. All the models of a type will be loaded in the store
   * The return options will be key: id of the model, and value: name of the model
   * @param modelName The modelname you want to load select options for
   * @param nameField The nameField to be used when populating the label part of the selectOption
   */
  @task({ enqueue: true, maxConcurrency: 4 })
  async getModelSelectOptions(
    modelName: string,
    query: Query | undefined,
    nameField: string | undefined
  ) {
    let models;

    if (!nameField) {
      nameField = 'name';
    }

    if (query) {
      // @ts-ignore
      models = await query.fetch(this.store);
    } else if (this.loadedModelNames.includes(modelName)) {
      models = this.store.peekAll(modelName);
    } else {
      // @ts-ignore
      models = await this.store.loadRecords(modelName);
      this.loadedModelNames.push(modelName);
    }

    const selectOptions: SelectOption[] = [];

    if (models) {
      for (const model of models.toArray()) {
        const selectOption: SelectOption = {
          value: model.id,
          label: model.get(nameField),
        };

        selectOptions.push(selectOption);
      }
    }

    return selectOptions;
  }

  /**
   * This transforms the meta FieldModel to the SelectOptions that can be used in ember-field-components select components
   * @param fieldModel The field model
   */
  transformFieldSelectOptionsToSelectOptions(
    fieldModel: FieldInterface
  ): SelectOption[] {
    const transformedSelectOptions: SelectOption[] = [];

    if (fieldModel.selectOptions) {
      for (const key in fieldModel.selectOptions) {
        const selectOption: SelectOption = {
          value: key,
          label: fieldModel.selectOptions[key],
        };

        transformedSelectOptions.push(selectOption);
      }
    }

    return transformedSelectOptions;
  }
}
