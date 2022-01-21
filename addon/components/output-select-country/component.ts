import AddressService from "@getflights/ember-mist-components/services/address";
import BaseOutput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseOutput";
import { task } from "ember-concurrency";
import { inject as service } from "@ember/service";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { taskFor } from "ember-concurrency-ts";

export interface SelectCountryArguments extends Arguments {
  value?: string;
}

export default class OutputSelectCountryComponent extends BaseOutput<
  Arguments
> {
  @service address!: AddressService;

  type = "select-country";
  selectOptions?: SelectOption[];

  constructor(owner: any, args: SelectCountryArguments) {
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
