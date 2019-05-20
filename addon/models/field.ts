import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';
import { belongsTo } from '@ember-decorators/data';
import MetaModelModel from './meta-model';

export default class FieldModel extends Model {
  @attr('string')
  name !: string;

  @attr('string')
  label !: string;

  @attr('string')
  apiName !: string;

  @attr('number')
  cardinality !: number;

  @attr('string')
  defaultValue ?: string;

  @attr()
  selectOptions ?: any;

  /* Relationships */
  @belongsTo('meta-model', { inverse: 'fields', async: false })
  model !: MetaModelModel;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'field' : FieldModel
  }
}
