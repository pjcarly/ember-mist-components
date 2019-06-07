import MistModel from './mist-model';
import { field } from 'ember-field-components/model/attribute';

export default abstract class DrupalModel extends MistModel {

  @field('datetime', { readOnly: true })
  created ?: Date;

  @field('datetime', { readOnly: true })
  changed ?: Date;
}
