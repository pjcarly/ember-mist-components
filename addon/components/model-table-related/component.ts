import Component from '@ember/component';
import EntityCacheService from 'ember-mist-components/services/entity-cache';
import EntityRouterService from 'ember-mist-components/services/entity-router';
import FieldInformationService from 'ember-field-components/services/field-information';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import Condition from 'ember-mist-components/query/Condition';
import { computed, action } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { dasherize } from '@ember/string';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ModelTableRelatedComponent extends Component {
  @service entityCache !: EntityCacheService;
  @service entityRouter !: EntityRouterService;
  @service fieldInformation !: FieldInformationService;
  @service store !: Store;

  model !: Model;
  field !: string;

  //  hook that can be passed in
  preProcessNewHook(newModel: Model) : Model {
    return newModel;
  }

  @computed('model', 'field')
  get hasManyModelName() : string {
    return this.fieldInformation.getHasManyModelName(this.fieldInformation.getModelName(this.model), this.field);
  }

  @computed('model', 'field')
  get inverseRelationship() : string {
    return this.fieldInformation.getInverseRelationshipName(this.fieldInformation.getModelName(this.model), this.field);
  }

  @computed('model', 'inverseRelationship')
  get conditions() : Condition[] {
    const conditions : Condition[] = [];
    conditions.push(new Condition(dasherize(this.inverseRelationship), '=', undefined, this.model.id));

    return conditions;
  }

  @action
  newFromRelated() {
    let cachedModel = this.store.createRecord(this.hasManyModelName);
    cachedModel.set(this.inverseRelationship, this.model);
    cachedModel = this.preProcessNewHook(cachedModel);

    this.entityCache.set('cachedModel', cachedModel);
    this.entityCache.set('returnToModel', this.model);

    this.get('entityRouter').transitionToCreate(this.hasManyModelName);
  }
}
