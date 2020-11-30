import MistModel from "./mist-model";
import { field } from "@getflights/ember-mist-components/decorators/attribute";
import DrupalModelInterface from "@getflights/ember-mist-components/interfaces/drupal-model";

// @ts-ignore
export default abstract class DrupalModel
  extends MistModel
  implements DrupalModelInterface {
  @field("datetime", { readOnly: true })
  created?: Date;

  @field("datetime", { readOnly: true })
  changed?: Date;
}
