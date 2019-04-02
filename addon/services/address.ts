import Service from "@ember/service";
import { inject as service } from "@ember-decorators/service";

export default class DynamicSelectOptionService extends Service {
  @service storage !: any;
  @service ajax !: any;


}
