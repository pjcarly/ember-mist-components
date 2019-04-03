import AddressService from 'ember-mist-components/services/address';
import BaseOutput from 'ember-field-components/components/BaseOutput';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember-decorators/service';

export default class OutputSelectCountryComponent extends BaseOutput {
  @service address !: AddressService;

  selectOptions ?: SelectOption[];

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.setCountrySelectOptions.perform();
  }

  @task
  * setCountrySelectOptions() : SelectOption[] {
    const selectOptions = yield this.address.getCountrySelectOptions.perform();

    if(selectOptions) {
      this.set('selectOptions', selectOptions);
    } else {
      this.set('selectOptions', []);
    }
  }
}
