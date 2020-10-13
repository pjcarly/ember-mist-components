import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { isBlank } from "@ember/utils";
import { computed, action } from "@ember/object";
import { debug, assert } from "@ember/debug";
import { task } from "ember-concurrency-decorators";
import { timeout } from "ember-concurrency";
import { tagName } from "@ember-decorators/component";
import Store from "@ember-data/store";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import { Operator } from "@getflights/ember-mist-components/query/Condition";
import Query from "@getflights/ember-mist-components/query/Query";

@tagName("")
export default class InputModelAutocompleteComponent extends Component {
  @service store!: Store;

  /**
   * Query that can be passed in to limit the results to
   */
  baseQuery?: Query;

  /**
   * The passed in name of the model
   */
  modelName!: string;

  /**
   * Options that can be passed in.
   * `hideClear` see this.shouldHideClear
   * `searchQuery` see this.shouldUseSearchQuery
   */
  options?: any;

  /**
   * The passed in inputId that will be used
   */
  inputId?: string;

  /**
   * The passed in placeholder for the autocomplete component
   */
  placeholder?: string;

  /**
   * The passed in value that will be used as the selected value in the autocomplete component
   */
  value?: any;

  /* Closure Actions */
  valueChanged(_: DrupalModel) {}

  @task
  *searchTask(searchQuery: string) {
    assert(
      "You must pass in the attribute modelName",
      !isBlank(this.modelName)
    );

    yield timeout(500); // Lets debounce the typing by 500ms
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
  @computed("options.searchQuery")
  get shouldUseSearchQuery(): boolean {
    return (
      !isBlank(this.options) &&
      "searchQuery" in this.options &&
      this.options.searchQuery
    );
  }

  /**
   * Hides the clear button on the power select component
   */
  @computed("options.hideClear")
  get shouldHideClear(): boolean {
    return !isBlank(this.options) && this.options.hideClear;
  }

  @computed("baseQuery")
  get query(): Query {
    const query = new Query(this.modelName);

    if (this.baseQuery) {
      query.copyFrom(this.baseQuery);
      query.setModelName(this.modelName);
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
    if (this.focusComesFromOutside(e)) {
      select.actions.open();
    }
  }

  @action
  formValueChanged(value: any) {
    this.valueChanged(value);
  }
}
