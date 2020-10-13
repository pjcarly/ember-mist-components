import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { tagName } from "@ember-decorators/component";
import Store from "@ember-data/store";
import { action, computed } from "@ember/object";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import ConditionModel from "@getflights/ember-mist-components/models/condition";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";

@tagName("")
export default class ConditionsEditComponent extends Component {
  @service store!: Store;

  model!: ListViewModel;

  setAllConditionsSort() {
    // This function sets the order of the sort variables on the items correctly. If 1 item gets inserted in the list,
    // this function will preserve the new order, but make sure no sort value will be the same over all the types
    const conditions = this.model.conditions;
    let topSort = 1;

    conditions.toArray().forEach((condition) => {
      if (!condition.isDeleted) {
        condition.set("sort", topSort);
        topSort++;
      }
    });
  }

  @computed("model.model")
  get fieldQuery(): Query {
    const model = this.model.model;
    const query = new Query("field");

    if (model) {
      query.addCondition(new Condition("model", "=", model.id));
    }

    return query;
  }

  @action
  addNewCondition() {
    const condition = this.store.createRecord("condition");
    condition.set("parent", this.model);
    condition.set("sort", this.model.conditions.length);
    this.model.conditions.pushObject(condition);
  }

  @action
  deleteCondition(conditionToDelete: ConditionModel) {
    this.model.conditions.toArray().forEach((condition) => {
      if (
        condition.sort &&
        conditionToDelete.sort &&
        condition.sort > conditionToDelete.sort
      ) {
        condition.set("sort", condition.sort - 1);
      }
    });

    conditionToDelete.deleteRecord();
    this.setAllConditionsSort();
  }

  @action
  reorderConditions(reorderedConditions: Array<ConditionModel>) {
    reorderedConditions.forEach((condition, index) => {
      condition.set("sort", index);
    });
  }
}
