import BaseInput from 'ember-field-components/components/BaseInput';
import FieldInformationService from 'ember-field-components/services/field-information';
import { computed } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { isArray } from '@ember/array';
import { action } from '@ember-decorators/object';
import DrupalModel from 'ember-mist-components/models/drupal-model';
import Condition from 'ember-mist-components/query/Condition';

export default class InputLookup extends BaseInput {
  @service intl !: any;
  @service fieldInformation !: FieldInformationService;

  type = 'lookup';

  /**
   * The name of the model, this can either be 1 or multiple
   */
  modelName !: string | string[];
  modalVisible : boolean = false;
  inputGroup : boolean = true;
  conditions : Condition[] = [];

  @computed('value', 'modelName')
  get activeModelName() : string {
    // needed for polymorphic relationships
    if(isArray(this.modelName)) {
      if(this.value) {
        return this.fieldInformation.getModelName(this.value);
      } else {
        return this.modelName[0];
      }
    } else {
      return this.modelName;
    }
  }

  @computed('activeModelName', 'intl.locale')
  get modelTitle() : string {
    return this.fieldInformation.getTranslatedPlural(this.activeModelName);
  }

  @action
  clearLookup() {
    this.set('computedValue', null);
  }

  @action
  doChangeValue(model: DrupalModel) {
    this.set('computedValue', model);
  }
}
