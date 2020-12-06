import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";
import { action } from "@ember/object";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import SortOrderModel from "@getflights/ember-mist-components/models/order";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";

interface Arguments {
  model: ListViewModel;
}

export default class SortOrdersEditComponent extends Component<Arguments> {
  @service store!: Store;

  setAllOrdersSort() {
    // This function sets the order of the sort variables on the items correctly. If 1 item gets inserted in the list,
    // this function will preserve the new order, but make sure no sort value will be the same over all the types
    let topSort = 1;

    this.args.model.orders.toArray().forEach((order) => {
      // @ts-ignore
      if (!order.isDeleted) {
        order.sort = topSort;
        topSort++;
      }
    });
  }

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
    const order = <SortOrderModel>this.store.createRecord("order");
    order.parent = this.args.model;
    order.sort = <number>(<unknown>this.args.model.orders.length);
    this.args.model.orders.pushObject(order);
  }

  @action
  deleteOrder(orderToDelete: SortOrderModel) {
    this.args.model.orders.toArray().forEach((order) => {
      if (order.sort && orderToDelete.sort && order.sort > orderToDelete.sort) {
        order.sort = order.sort - 1;
      }
    });

    orderToDelete.deleteRecord();
    this.setAllOrdersSort();
  }

  @action
  reorderOrders(reorderedOrders: Array<SortOrderModel>) {
    reorderedOrders.forEach((order, index) => {
      order.sort = index;
    });
  }
}
