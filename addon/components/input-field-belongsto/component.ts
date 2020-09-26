import InputFieldComponent from "@getflights/ember-field-components/components/input-field/component";
import Condition, {
  Operator,
} from "@getflights/ember-mist-components/query/Condition";
import BelongsToFilterInterface from "@getflights/ember-mist-components/interfaces/belongs-to-filters";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import Model from "@ember-data/model";
import { dropTask } from "ember-concurrency-decorators";
import { computed, action } from "@ember/object";
import { isBlank } from "@ember/utils";
import { assert } from "@ember/debug";
import { dasherize } from "@ember/string";
import { inject as service } from "@ember/service";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import Query from "@getflights/ember-mist-components/query/Query";
import { isArray } from "@ember/array";
import { FieldOptionsInterface } from "@getflights/ember-field-components/services/field-information";
import { taskFor } from "ember-concurrency-ts";

export interface BelongsToFieldOptionsInterface extends FieldOptionsInterface {
  filters: any;
  polymorphic: boolean;
}

export default class InputFieldBelongsToComponent extends InputFieldComponent {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  selectOptions: SelectOption[] = [];

  didReceiveAttrs() {
    // @ts-ignore
    super.didReceiveAttrs(...arguments);
    taskFor(this.setSelectOptions).perform();
  }

  @computed("model", "field")
  get relationshipModelName(): string | string[] {
    if (this.isPolymorphic) {
      return this.fieldInformation.getBelongsToModelNames(
        // @ts-ignore
        this.modelName,
        this.field
      );
    }

    // @ts-ignore
    return this.fieldInformation.getBelongsToModelName(
      // @ts-ignore
      this.modelName,
      this.field
    );
  }

  @computed("fieldOptions")
  get isPolymorphic(): boolean {
    const options = <BelongsToFieldOptionsInterface>this.fieldOptions;
    return (
      !isBlank(options) &&
      options.hasOwnProperty("polymorphic") &&
      options.polymorphic
    );
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
        selectOptions = yield taskFor(
          this.dynamicSelectOptions.getModelSelectOptions
        ).perform(
          <string>this.relationshipModelName,
          this.baseQuery,
          this.nameField
        );
      } else {
        // @ts-ignore
        selectOptions = yield taskFor(
          this.dynamicSelectOptions.getModelSelectOptions
        ).perform(
          <string>this.relationshipModelName,
          undefined,
          this.nameField
        );
      }

      this.set("selectOptions", selectOptions);
    }
  }

  @computed("widgetName")
  get isSelect(): boolean {
    return this.widgetName === "select";
  }

  @computed("value")
  get relationshipId(): string | undefined {
    if (this.value) {
      return this.value.id;
    }

    return;
  }

  @computed("options.nameField")
  get nameField(): string {
    let nameField = "name";

    if (this.options && this.options.nameField) {
      nameField = this.options.nameField;
    }

    return nameField;
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
    const fieldOptions = <BelongsToFieldOptionsInterface>this.fieldOptions;
    if (fieldOptions && fieldOptions.filters) {
      const fieldFilters = <BelongsToFilterInterface[]>fieldOptions.filters;

      for (const fieldFilter of fieldFilters) {
        if (fieldFilter.operator) {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              fieldFilter.operator,
              fieldFilter.value
            )
          );
        } else {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              Operator.EQUALS,
              fieldFilter.value
            )
          );
        }
      }
    }

    return query;
  }

  /**
   * If Only 1 value is available in the select options, and that value is selected, this returns true
   */
  @computed("selectOptions", "value")
  get noChoiceAvailable(): boolean {
    return (
      this.selectOptions.length === 1 &&
      this.selectOptions[0].value === this.relationshipId
    );
  }

  /**
   * Returns a component name for a dynamic component based on the type of relationship (for example you might want to customize all input fields of users differently than normal)
   */
  @computed("relationshipModelName")
  get dynamicComponentName(): string {
    if (this.relationshipModelName instanceof Array) {
      return `input-belongsto-${this.relationshipModelName.join("-")}`;
    } else {
      return `input-belongsto-${this.relationshipModelName}`;
    }
  }

  @action
  doChangeValue(value: DrupalModel | string) {
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
    }

    this.set("value", value);
  }
}
