import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";
import { action } from "@ember/object";
import { debug, assert } from "@ember/debug";
import { task } from "ember-concurrency-decorators";
import { timeout } from "ember-concurrency";
import Store from "@ember-data/store";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { Operator } from "@getflights/ember-mist-components/query/Condition";
import Query from "@getflights/ember-mist-components/query/Query";
import BaseInput, {
  Arguments,
  OptionsArgument,
} from "@getflights/ember-field-components/components/BaseInput";

interface ModelAutocompleteArguments extends Arguments {
  /**
   * The passed in name of the model
   */
  modelName: string;

  /**
   * Query that can be passed in to limit the results to
   */
  baseQuery?: Query;

  value?: DrupalModel;

  /**
   * Options that can be passed in.
   * `hideClear` see this.shouldHideClear
   * `searchQuery` see this.shouldUseSearchQuery
   */
  options?: InputOptionsArgument;
}

interface InputOptionsArgument extends OptionsArgument {
  hideClear: boolean;
  searchQuery: boolean;
}

export default class InputModelAutocompleteComponent extends BaseInput<ModelAutocompleteArguments> {
  @service store!: Store;

  type = "model-autocomplete";

  @task
  async searchTask(searchQuery: string) {
    assert(
      "You must pass in the attribute modelName",
      !isBlank(this.args.modelName)
    );

    await timeout(500); // Lets debounce the typing by 500ms
    const query = this.query;

    query.clearSearch();
    query.clearSearchQuery();

    if (this.shouldUseSearchQuery) {
      query.setSearchQuery(searchQuery);
    } else {
      query.setSearch(searchQuery, Operator.STARTS_WITH, "name");
    }

    return query
      .fetch(this.store)
      .then((results: any) => {
        return results;
      })
      .catch((error: any) => {
        debug(error);
      });
  }

  /**
   * Decides whether the attribute searchQuery on the Query should be used, or the search should happen on the `name` field
   */
  get shouldUseSearchQuery(): boolean {
    return this.args.options?.searchQuery ?? false;
  }

  /**
   * Hides the clear button on the power select component
   */
  get shouldHideClear(): boolean {
    return this.args.options?.hideClear ?? false;
  }

  get query(): Query {
    const query = new Query(this.args.modelName);

    if (this.args.baseQuery) {
      query.copyFrom(this.args.baseQuery);
      query.setModelName(this.args.modelName);
    }

    return query;
  }

  /**
   * The EmberPowerSelect implementation of the focus functionality (see documentation)
   * @param e EmberPowerSelect Event
   */
  focusComesFromOutside(e: any) {
    let blurredEl = e.relatedTarget;
    if (isBlank(blurredEl)) {
      return false;
    }
    return !blurredEl.classList.contains("ember-power-select-search-input");
  }

  /**
   * The EmberPowerSelect implementation of the focus functionality (see documentation)
   * @param select The EmberPowerSelect component
   * @param e EmberPowerSelect Event
   */
  @action
  handleFocus(select: any, e: any) {
    if (select && this.focusComesFromOutside(e)) {
      select.actions.open();
    }
  }

  @action
  formValueChanged(value?: DrupalModel) {
    if (this.args.valueChanged) {
      this.args.valueChanged(value);
    }
  }
}
