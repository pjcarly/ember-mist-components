import InputFieldComponent from "ember-field-components/components/input-field/component";
import Condition, { Operator } from "ember-mist-components/query/Condition";
import BelongsToFilterInterface from "ember-mist-components/interfaces/belongs-to-filters";
import { computed, action } from "@ember/object";
import { assert } from "@ember/debug";
import { dasherize } from "@ember/string";
import Query from "ember-mist-components/query/Query";
import { isArray } from "@ember/array";
import MistModel from "ember-mist-components/models/mist-model";
import MutableArray from "@ember/array/mutable";
import { dropTask } from "ember-concurrency-decorators";
import DynamicSelectOptionService from "ember-mist-components/services/dynamic-select-options";
import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import { FieldOptionsInterface } from "ember-field-components/services/field-information";
import Model from "ember-data/model";

export interface HasManyFieldOptionsInterface extends FieldOptionsInterface {
  filters: any;
  polymorphic: boolean;
}

export default class InputFieldHasManyComponent extends InputFieldComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  selectOptions: SelectOption[] = [];

  didReceiveAttrs() {
    super.didReceiveAttrs();
    // @ts-ignore
    this.setSelectOptions.perform();
  }

  @dropTask
  *setSelectOptions() {
    if (this.isSelect) {
      assert(
        "Select widget is not supported for polymorphic relationships",
        !this.isPolymorphic
      );

      // loadAll is provided by the ember-data-storefront addon, and does magic to not load data twice
      // This is really helpful in case there are multiple components referencing to the same type in the template
      // The query will only be done once

      let selectOptions = [];

      if (
        this.baseQuery.conditions ||
        this.baseQuery.conditionLogic ||
        this.baseQuery.orders
      ) {
        // @ts-ignore
        selectOptions = yield this.dynamicSelectOptions.getModelSelectOptions.perform(
          this.relationshipModelName,
          this.baseQuery,
          this.nameField
        );
      } else {
        // @ts-ignore
        selectOptions = yield this.dynamicSelectOptions.getModelSelectOptions.perform(
          this.relationshipModelName,
          undefined,
          this.nameField
        );
      }

      this.set("selectOptions", selectOptions);
    }
  }

  @computed("options.nameField")
  get nameField(): string {
    let nameField = "name";

    if (this.options && this.options.nameField) {
      nameField = this.options.nameField;
    }

    return nameField;
  }

  @computed("fieldOptions")
  get isPolymorphic(): boolean {
    const options = <HasManyFieldOptionsInterface>this.fieldOptions;
    return (
      !isBlank(options) &&
      options.hasOwnProperty("polymorphic") &&
      options.polymorphic
    );
  }

  @computed("model", "field")
  get relationshipModelName(): string | string[] {
    return this.fieldInformation.getHasManyModelName(
      // @ts-ignore
      this.modelName,
      this.field
    );
  }

  @computed("fieldOptions.filters", "options.baseQuery")
  get baseQuery(): Query {
    // Lets first check for passed in query
    const modelName = isArray(this.relationshipModelName)
      ? this.relationshipModelName[0]
      : this.relationshipModelName;
    const query = Query.create({ modelName: modelName });

    if (this.options && this.options.baseQuery) {
      assert(
        "baseQuery option  must be of type: ember-mist-components/query/Query",
        this.options.baseQuery instanceof Query
      );

      query.copyFrom(this.options.baseQuery);
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

  @computed("widgetName")
  get isSelect(): boolean {
    return this.widgetName === "select";
  }

  @action
  reorderedValues(values: MutableArray<MistModel>) {
    this.set("value", values);
  }

  @action
  doChangeValue(index: number, value: MistModel | string) {
    if (value) {
      if (!(value instanceof Model)) {
        // In case a Select widget was used, the returned value is not the Model itself, but the ID of the model,
        // We must find that model in the store by the ID (which should be loaded in the store already because of the setSelectOptions function above)
        // This isnt possible with polymorphic relationships
        assert(
          "Select widget is not supported for polymorphic relationships",
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

      this.value.replace(index, 1, [value]);
    } else {
      this.value.removeAt(index, 1);
    }
  }

  @action
  newValue(value: MistModel) {
    this.value.pushObject(value);
  }
}
