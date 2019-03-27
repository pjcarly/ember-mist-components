import BaseModel from 'ember-field-components/model/base-model';
import { field } from 'ember-field-components/model/attribute';

export default abstract class DrupalModel extends BaseModel {
  @field('datetime', { readOnly: true })
  created ?: Date;

  @field('datetime', { readOnly: true })
  changed ?: Date;
}
