import AddressService from "@getflights/ember-mist-components/services/address";
import BaseOutput from "@getflights/ember-field-components/components/BaseOutput";
import { task } from "ember-concurrency-decorators";
import { inject as service } from "@ember/service";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { taskFor } from "ember-concurrency-ts";

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
