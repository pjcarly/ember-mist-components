import InputFieldComponent, {
  InputFieldArguments,
} from '@getflights/ember-field-components/components/input-field/component';
import Condition, {
  Operator,
} from '@getflights/ember-mist-components/query/Condition';
import BelongsToFilterInterface from '@getflights/ember-mist-components/interfaces/belongs-to-filters';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { dasherize } from '@ember/string';
import Query from '@getflights/ember-mist-components/query/Query';
import { isArray } from '@ember/array';
import { dropTask } from 'ember-concurrency-decorators';
import DynamicSelectOptionService from '@getflights/ember-mist-components/services/dynamic-select-options';
import { inject as service } from '@ember/service';
import SelectOption from '@getflights/ember-field-components/interfaces/SelectOption';
import { FieldOptionsInterface } from '@getflights/ember-field-components/services/field-information';
import Model from '@ember-data/model';
import { taskFor } from 'ember-concurrency-ts';
import { tracked } from '@glimmer/tracking';
import NativeArray from '@ember/array/-private/native-array';

export interface HasManyFieldOptionsInterface extends FieldOptionsInterface {
  filters: any;
  polymorphic: boolean;
}

export interface InputFieldHasManyArguments
  extends InputFieldArguments<NativeArray<Model>> {
  options?: InputFieldHasManyOptionsArgument;
}

export interface InputFieldHasManyOptionsArgument {
  nameField?: string;
  baseQuery?: Query;
}

export default class InputFieldHasManyComponent extends InputFieldComponent<
  InputFieldHasManyArguments,
  NativeArray<Model>
> {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  @tracked selectOptions: SelectOption[] = [];

  constructor(owner: any, args: InputFieldHasManyArguments) {
    super(owner, args);
    taskFor(this.setSelectOptions).perform();
  }

  @dropTask
  async setSelectOptions() {
    if (this.isSelect) {
      assert(
        'Select widget is not supported for polymorphic relationships',
        !this.isPolymorphic
      );

      // loadAll is provided by the ember-data-storefront addon, and does magic to not load data twice
      // This is really helpful in case there are multiple components referencing to the same type in the template
      // The query will only be done once

      let selectOptions = [];

      if (
        this.baseQuery.hasConditions ||
        this.baseQuery.hasConditionLogic ||
        this.baseQuery.hasOrders
      ) {
        selectOptions = await taskFor(
          this.dynamicSelectOptions.getModelSelectOptions
        ).perform(
          <string>this.relationshipModelName,
          this.baseQuery,
          this.nameField
        );
      } else {
        selectOptions = await taskFor(
          this.dynamicSelectOptions.getModelSelectOptions
        ).perform(
          <string>this.relationshipModelName,
          undefined,
          this.nameField
        );
      }

      this.selectOptions = selectOptions;
    }
  }

  get nameField(): string {
    let nameField = 'name';

    if (this.args.options && this.args.options.nameField) {
      nameField = this.args.options.nameField;
    }

    return nameField;
  }

  get isPolymorphic(): boolean {
    const options = <HasManyFieldOptionsInterface>this.fieldOptions;
    return (
      options && options.hasOwnProperty('polymorphic') && options.polymorphic
    );
  }

  get relationshipModelName(): string | string[] {
    // @ts-ignore
    return this.fieldInformation.getHasManyModelName(
      // @ts-ignore
      this.modelName,
      this.args.field
    );
  }

  get baseQuery(): Query {
    // Lets first check for passed in query
    const modelName = isArray(this.relationshipModelName)
      ? this.relationshipModelName[0]
      : this.relationshipModelName;
    const query = new Query(modelName);

    if (this.args.options && this.args.options.baseQuery) {
      assert(
        'baseQuery option  must be of type: ember-mist-components/query/Query',
        this.args.options.baseQuery instanceof Query
      );

      query.copyFrom(this.args.options.baseQuery);
    }

    // And also add conditions defined on the field options
    const fieldOptions = <HasManyFieldOptionsInterface>this.fieldOptions;
    if (fieldOptions && fieldOptions.filters) {
      const fieldFilters = <BelongsToFilterInterface[]>fieldOptions.filters;

      for (const fieldFilter of fieldFilters) {
        if (fieldFilter.operator) {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              fieldFilter.operator,
              fieldFilter.value,
              // @ts-ignore
              fieldFilter.id
            )
          );
        } else {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              Operator.EQUALS,
              fieldFilter.value,
              // @ts-ignore
              fieldFilter.id
            )
          );
        }
      }
    }

    return query;
  }

  get isSelect(): boolean {
    return this.widgetName === 'select';
  }

  @action
  reorderedValues(values: NativeArray<Model>) {
    this.setNewValue(values);
  }

  @action
  doChangeValue(index: number | undefined, value: Model | string) {
    const oldValue = this.value;

    if (value) {
      if (!(value instanceof Model)) {
        // In case a Select widget was used, the returned value is not the Model itself, but the ID of the model,
        // We must find that model in the store by the ID (which should be loaded in the store already because of the setSelectOptions function above)
        // This isnt possible with polymorphic relationships
        assert(
          'Select widget is not supported for polymorphic relationships',
          !this.isPolymorphic
        );

        const foundModel = this.store.peekRecord(
          <string>this.relationshipModelName,
          <string>value
        );
        assert(
          `Model with id: ${value} and type: ${this.relationshipModelName} not found in store`,
          foundModel
        );

        value = foundModel;
      }

      if (this.value) {
        this.value.replace(index ?? this.value.length, 1, [value]);
      }
    } else {
      if (this.value && (index || index === 0)) {
        this.value.removeAt(index, 1);
      }
    }

    this.notifyExternalAction(this.value, oldValue);
  }
}
