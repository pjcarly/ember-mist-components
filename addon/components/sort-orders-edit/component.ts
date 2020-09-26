import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { tagName } from "@ember-decorators/component";
import Store from "@ember-data/store";
import { action, computed } from "@ember/object";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import SortOrderModel from "@getflights/ember-mist-components/models/order";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";

@tagName("")
export default class SortOrdersEditComponent extends Component {
  @service
  store!: Store;

  model!: ListViewModel;

  setAllOrdersSort() {
    // This function sets the order of the sort variables on the items correctly. If 1 item gets inserted in the list,
    // this function will preserve the new order, but make sure no sort value will be the same over all the types
    let topSort = 1;

    this.model.orders.toArray().forEach((order) => {
      // @ts-ignore
      if (!order.isDeleted) {
        order.set("sort", topSort);
        topSort++;
      }
    });
  }

  @computed("model.model")
  get fieldQuery(): Query {
    const model = this.model.model;
    const query = Query.create({ modelName: "field" });

    if (model) {
      query.addCondition(new Condition("model", "=", model.id));
    }

    return query;
  }

  @action
  addNewOrder() {
    const order = <SortOrderModel>this.store.createRecord("order");
    order.set("parent", this.model);
    order.set("sort", this.model.orders.length);
    this.model.orders.pushObject(order);
  }

  @action
  deleteOrder(orderToDelete: SortOrderModel) {
    this.model.orders.toArray().forEach((order) => {
      if (order.sort && orderToDelete.sort && order.sort > orderToDelete.sort) {
        order.set("sort", order.sort - 1);
      }
    });

    orderToDelete.deleteRecord();
    this.setAllOrdersSort();
  }

  @action
  reorderOrders(reorderedOrders: Array<SortOrderModel>) {
    reorderedOrders.forEach((order, index) => {
      order.set("sort", index);
    });
  }
}
