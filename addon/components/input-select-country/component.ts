import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";
import AddressService from "@getflights/ember-mist-components/services/address";
import BaseInput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseInput";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { taskFor } from "ember-concurrency-ts";

export default class InputSelectCountryComponent extends BaseInput<Arguments> {
  @service address!: AddressService;
  type = "address";

  selectOptions?: SelectOption[];

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    taskFor(this.setCountrySelectOptions).perform();
  }

  @task
  async setCountrySelectOptions() {
    const selectOptions = await taskFor(
      this.address.getCountrySelectOptions
    ).perform();

    if (selectOptions) {
      this.selectOptions = selectOptions;
    } else {
      this.selectOptions = [];
    }
  }
}
