import Component from "@glimmer/component";
import EntityCacheService from "@getflights/ember-mist-components/services/entity-cache";
import EntityRouterService from "@getflights/ember-mist-components/services/entity-router";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import Store from "@ember-data/store";
import Model from "@ember-data/model";
import Condition, {
  Operator,
} from "@getflights/ember-mist-components/query/Condition";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { dasherize } from "@ember/string";
import Query from "@getflights/ember-mist-components/query/Query";

interface Arguments {
  model: Model;
  field: string;
  title?: string;
  modelListView?: string;
  listViewGrouping?: string;
  hideNew?: boolean;
  baseQuery?: Query;
}

export default class ModelTableRelatedComponent extends Component<Arguments> {
  @service entityCache!: EntityCacheService;
  @service entityRouter!: EntityRouterService;
  @service fieldInformation!: FieldInformationService;
  @service store!: Store;

  //  hook that can be passed in
  preProcessNewHook(newModel: Model): Model {
    return newModel;
  }

  get hasManyModelName(): string {
    // @ts-ignore
    return this.fieldInformation.getHasManyModelName(
      this.fieldInformation.getModelName(this.args.model),
      this.args.field
    );
  }

  get inverseRelationship(): string | undefined {
    return this.fieldInformation.getInverseRelationshipName(
      this.fieldInformation.getModelName(this.args.model),
      this.args.field
    );
  }

  get baseQuery(): Query {
    const query = new Query(this.hasManyModelName);
    const inverseRelationship = this.inverseRelationship;

    if (this.args.baseQuery) {
      query.copyFrom(this.args.baseQuery);
    }

    if (inverseRelationship) {
      query.addCondition(
        new Condition(
          dasherize(inverseRelationship),
          Operator.EQUALS,
          undefined,
          this.args.model.id
        )
      );
    } else {
      query.addCondition(new Condition("dummy", Operator.EQUALS, "dummy"));
    }

    return query;
  }

  @action
  newFromRelated() {
    let cachedModel = this.store.createRecord(this.hasManyModelName);
    cachedModel.set(this.inverseRelationship, this.args.model);
    cachedModel = this.preProcessNewHook(cachedModel);

    this.entityCache.set("cachedModel", cachedModel);
    this.entityCache.set("returnToModel", this.args.model);

    this.entityRouter.transitionToCreate(this.hasManyModelName);
  }
}
