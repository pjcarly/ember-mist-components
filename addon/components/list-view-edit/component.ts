import Component from "@ember/component";
import { tagName } from "@ember-decorators/component";
import ListViewModel from "@getflights/ember-mist-components/models/list-view";
import Query from "@getflights/ember-mist-components/query/Query";
import { computed } from "@ember/object";
import Condition from "@getflights/ember-mist-components/query/Condition";

@tagName("")
export default class ListViewEditComponent extends Component {
  model!: ListViewModel;

  @computed("model.model")
  get fieldQuery(): Query {
    const model = this.model.model;
    const query = Query.create({ modelName: "field" });

    if (model) {
      query.addCondition(new Condition("model", "=", model.id));
    }

    return query;
  }
}
