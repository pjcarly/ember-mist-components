import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";
import { action } from "@ember/object";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";
import ConditionInterface from "@getflights/ember-mist-components/interfaces/condition";
import ListViewInterface from "@getflights/ember-mist-components/interfaces/list-view";

interface Arguments {
  model: ListViewInterface;
}

export default class ConditionsEditComponent extends Component<Arguments> {
  @service store!: Store;

  get fieldQuery(): Query {
    const model = this.args.model.model;
    const query = new Query("field");

    if (model) {
      query.addCondition(new Condition("model", "=", model.id));
    }

    return query;
  }

  @action
  addNewCondition() {
    const condition = <ConditionInterface>this.store.createRecord("condition");
    this.args.model.conditions.pushObject(condition);
  }

  @action
  deleteCondition(conditionToDelete: ConditionInterface) {
    conditionToDelete.deleteRecord();
  }

  @action
  reorderConditions(reorderedConditions: Array<ConditionInterface>) {
    this.args.model.conditions.clear();

    reorderedConditions.forEach((condition) => {
      this.args.model.conditions.pushObject(condition);
    });
  }
}
