import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";
import { action } from "@ember/object";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";
import ListViewInterface from "@getflights/ember-mist-components/interfaces/list-view";
import SortOrderInterface from "@getflights/ember-mist-components/interfaces/sort-order";

interface Arguments {
  model: ListViewInterface;
}

export default class SortOrdersEditComponent extends Component<Arguments> {
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
  addNewOrder() {
    const order = <SortOrderInterface>this.store.createRecord("order");
    this.args.model.sortOrders.pushObject(order);
  }

  @action
  deleteOrder(orderToDelete: SortOrderInterface) {
    orderToDelete.deleteRecord();
  }

  @action
  reorderOrders(reorderedOrders: Array<SortOrderInterface>) {
    this.args.model.sortOrders.clear();

    reorderedOrders.forEach((order) => {
      this.args.model.sortOrders.pushObject(order);
    });
  }
}
