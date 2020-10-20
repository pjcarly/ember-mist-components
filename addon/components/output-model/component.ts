import BaseOutput from "@getflights/ember-field-components/components/BaseOutput";
import MistModel from "@getflights/ember-mist-components/models/mist-model";
import { Arguments } from "../model-table/component";

export interface ModelArguments extends Arguments {
  value?: MistModel;
}

export default class OutputModelComponent extends BaseOutput<ModelArguments> {
  type = "model";
}
