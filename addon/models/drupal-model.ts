import MistModel from "./mist-model";
import { field } from "ember-field-components/model/attribute";
import DrupalModelInterface from "ember-mist-components/interfaces/drupal-model";

// @ts-ignore
export default abstract class DrupalModel extends MistModel
  implements DrupalModelInterface {
  @field("datetime", { readOnly: true })
  created?: Date;

  @field("datetime", { readOnly: true })
  changed?: Date;
}
