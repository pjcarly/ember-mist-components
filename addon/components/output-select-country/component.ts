import AddressService from "ember-mist-components/services/address";
import BaseOutput from "ember-field-components/components/BaseOutput";
import { task } from "ember-concurrency-decorators";
import { inject as service } from "@ember/service";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";

export default class OutputSelectCountryComponent extends BaseOutput {
  @service address!: AddressService;

  selectOptions?: SelectOption[];

  didReceiveAttrs() {
    super.didReceiveAttrs();
    taskFor(this.setCountrySelectOptions).perform();
  }

  @task
  *setCountrySelectOptions() {
    const selectOptions = yield taskFor(
      this.address.getCountrySelectOptions
    ).perform();

    if (selectOptions) {
      this.set("selectOptions", selectOptions);
    } else {
      this.set("selectOptions", []);
    }
  }
}
