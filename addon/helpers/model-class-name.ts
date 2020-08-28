import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import MistModel from "@getflights/ember-mist-components/models/mist-model";

export default class ImageURLHelper extends Helper {
  @service fieldInformation!: FieldInformationService;

  compute([model]: [MistModel]): string {
    return this.fieldInformation.getModelName(model);
  }
}
