import Component from "@glimmer/component";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import Query from "@getflights/ember-mist-components/query/Query";
import Condition from "@getflights/ember-mist-components/query/Condition";

interface Arguments {
  model: ListViewModel;
}

export default class ListViewEditComponent extends Component<Arguments> {
  get fieldQuery(): Query {
    const model = this.args.model.model;
    const query = new Query("field");

    if (model) {
      query.addCondition(new Condition("model", "=", model.id));
    }

    return query;
  }
}
