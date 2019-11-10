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

export default class InputFieldHasManyComponent extends InputFieldComponent {
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
    if (this.fieldOptions && this.fieldOptions.filters) {
      const fieldFilters = <BelongsToFilterInterface[]>(
        this.fieldOptions.filters
      );

      for (const fieldFilter of fieldFilters) {
        if (fieldFilter.operator) {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              fieldFilter.operator,
              fieldFilter.value,
              fieldFilter.id
            )
          );
        } else {
          query.addCondition(
            new Condition(
              dasherize(fieldFilter.field),
              Operator.EQUALS,
              fieldFilter.value,
              fieldFilter.id
            )
          );
        }
      }
    }

    return query;
  }

  @action
  reorderedValues(values: MutableArray<MistModel>) {
    this.set("value", values);
  }

  @action
  doChangeValue(index: number, value: MistModel | null) {
    if (!value) {
      this.value.removeAt(index, 1);
    } else {
      this.value.replace(index, 1, [value]);
    }
  }

  @action
  newValue(value: MistModel) {
    this.value.pushObject(value);
  }
}
