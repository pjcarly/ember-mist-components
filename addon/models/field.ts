import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';

export default class FieldModel extends Model {
  @attr('string')
  name ?: string;

  @attr('string')
  apiName ?: string;

  @attr('string')
  model ?: string;

  @attr('number')
  cardinality ?: number;

  @attr('string')
  defaultValue ?: string;

  @attr()
  selectOptions ?: any;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'field' : FieldModel
  }
}
