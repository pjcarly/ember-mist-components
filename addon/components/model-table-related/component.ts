import Component from "@ember/component";
import EntityCacheService from "ember-mist-components/services/entity-cache";
import EntityRouterService from "ember-mist-components/services/entity-router";
import FieldInformationService from "ember-field-components/services/field-information";
import Store from "ember-data/store";
import Model from "ember-data/model";
import Condition from "ember-mist-components/query/Condition";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { dasherize } from "@ember/string";
import { tagName } from "@ember-decorators/component";
import Query from "ember-mist-components/query/Query";

@tagName("")
export default class ModelTableRelatedComponent extends Component {
  @service entityCache!: EntityCacheService;
  @service entityRouter!: EntityRouterService;
  @service fieldInformation!: FieldInformationService;
  @service store!: Store;

  model!: Model;
  field!: string;
  hideNew: boolean = false;

  //  hook that can be passed in
  preProcessNewHook(newModel: Model): Model {
    return newModel;
  }

  @computed("model", "field")
  get hasManyModelName(): string {
    return this.fieldInformation.getHasManyModelName(
      this.fieldInformation.getModelName(this.model),
      this.field
    );
  }

  @computed("model", "field")
  get inverseRelationship(): string {
    return this.fieldInformation.getInverseRelationshipName(
      this.fieldInformation.getModelName(this.model),
      this.field
    );
  }

  @computed("model", "inverseRelationship", "hasManyModelName")
  get baseQuery(): Query {
    const query = Query.create({ modelName: this.hasManyModelName });
    query.addCondition(
      new Condition(
        dasherize(this.inverseRelationship),
        "=",
        undefined,
        this.model.id
      )
    );

    return query;
  }

  @action
  newFromRelated() {
    let cachedModel = this.store.createRecord(this.hasManyModelName);
    cachedModel.set(this.inverseRelationship, this.model);
    cachedModel = this.preProcessNewHook(cachedModel);

    this.entityCache.set("cachedModel", cachedModel);
    this.entityCache.set("returnToModel", this.model);

    this.entityRouter.transitionToCreate(this.hasManyModelName);
  }
}
