import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
import Condition, {
  Operator,
} from "@getflights/ember-mist-components/query/Condition";
import BelongsToFilterInterface from "@getflights/ember-mist-components/interfaces/belongs-to-filters";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import Model from "@ember-data/model";
import { dropTask } from "ember-concurrency-decorators";
import { computed, action } from "@ember/object";
import { assert } from "@ember/debug";
import { dasherize } from "@ember/string";
import { inject as service } from "@ember/service";
import DynamicSelectOptionService from "@getflights/ember-mist-components/services/dynamic-select-options";
import Query from "@getflights/ember-mist-components/query/Query";
import { isArray } from "@ember/array";
import { FieldOptionsInterface } from "@getflights/ember-field-components/services/field-information";
import { taskFor } from "ember-concurrency-ts";
import { tracked } from "@glimmer/tracking";

export interface BelongsToFieldOptionsInterface extends FieldOptionsInterface {
  filters: any;
  polymorphic: boolean;
}

export interface InputFieldBelongsToArguments extends InputFieldArguments {
  options?: InputFieldBelongsToOptionsArgument;
}

export interface InputFieldBelongsToOptionsArgument {
  nameField?: string;
  baseQuery?: Query;
}

export default class InputFieldBelongsToComponent extends InputFieldComponent<
  InputFieldArguments
> {
  @service dynamicSelectOptions!: DynamicSelectOptionService;

  @tracked selectOptions: SelectOption[] = [];

  constructor(owner: any, args: InputFieldArguments) {
    super(owner, args);
    taskFor(this.setSelectOptions).perform();
  }

  get relationshipModelName(): string | string[] {
    if (this.isPolymorphic) {
      return this.fieldInformation.getBelongsToModelNames(
        // @ts-ignore
        this.modelName,
        this.args.field
      );
    }

    // @ts-ignore
    return this.fieldInformation.getBelongsToModelName(
      // @ts-ignore
      this.modelName,
      this.args.field
    );
  }

  @computed()
  get isPolymorphic(): boolean {
    const options = <BelongsToFieldOptionsInterface>this.fieldOptions;
    return (
      options && options.hasOwnProperty("polymorphic") && options.polymorphic
    );
  }

  @dropTask
  async setSelectOptions() {
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
        this.baseQuery.hasConditions ||
        this.baseQuery.hasConditionLogic ||
        this.baseQuery.hasOrders
      ) {
        // @ts-ignore
        selectOptions = await taskFor(
          this.dynamicSelectOptions.getModelSelectOptions
        ).perform(
          <string>this.relationshipModelName,
          this.baseQuery,
          this.nameField
        );
      } else {
        // @ts-ignore
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

  get isSelect(): boolean {
    return this.widgetName === "select";
  }

  get relationshipId(): string | undefined {
    if (this.value) {
      return this.value.id;
    }

    return;
  }

  get nameField(): string {
    let nameField = "name";

    if (this.args.options && this.args.options.nameField) {
      nameField = this.args.options.nameField;
    }

    return nameField;
  }

  get baseQuery(): Query {
    // Lets first check for passed in query
    const modelName = isArray(this.relationshipModelName)
      ? this.relationshipModelName[0]
      : this.relationshipModelName;
    const query = new Query(modelName);

    if (this.args.options && this.args.options.baseQuery) {
      assert(
        "baseQuery option  must be of type: ember-mist-components/query/Query",
        this.args.options.baseQuery instanceof Query
      );

      query.copyFrom(this.args.options.baseQuery);
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
  get noChoiceAvailable(): boolean {
    return (
      this.selectOptions.length === 1 &&
      this.selectOptions[0].value === this.relationshipId
    );
  }

  /**
   * Returns a component name for a dynamic component based on the type of relationship (for example you might want to customize all input fields of users differently than normal)
   */
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

    this.setNewValue(value);
  }
}
