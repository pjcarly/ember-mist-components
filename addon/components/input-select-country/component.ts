import { task } from "ember-concurrency-decorators";
import { inject as service } from "@ember/service";
import AddressService from "ember-mist-components/services/address";
import BaseInput from "ember-field-components/components/BaseInput";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import { taskFor } from "ember-concurrency-ts";

export default class InputSelectCountryComponent extends BaseInput {
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
