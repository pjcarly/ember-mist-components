import Service from "@ember/service";
import SelectOption from "ember-field-components/interfaces/SelectOption";
import { inject as service } from "@ember/service";
import { enqueueTask } from "ember-concurrency-decorators";
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
import { replaceAll } from "ember-field-components/classes/utils";
import { isBlank } from "@ember/utils";
import HttpService from "./http";

export default class AddressService extends Service {
  @service storage!: any;
  @service http!: HttpService;

  countrySelectOptions?: SelectOption[];
  addressFormats: Map<string, any> = new Map();
  subdivisionSelectOptions: Map<string, SelectOption[]> = new Map();

  @computed("config")
  get apiEndpoint(): string {
    return this.config.apiEndpoint;
  }

  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @computed("config")
  get shouldCache(): boolean {
    if (
      this.config.hasOwnProperty("ember-mist-components") &&
      this.config["ember-mist-components"].hasOwnProperty("cacheFields")
    ) {
      return this.config["ember-mist-components"].cacheFields;
    }

    return false;
  }

  /**
   * Returns the different countries in a select option format
   */
  @enqueueTask
  *getCountrySelectOptions() {
    // We first check in this service
    let countrySelectOptions = this.countrySelectOptions;
    if (countrySelectOptions) {
      return countrySelectOptions;
    }

    // We check the localstorage cache
    if (this.shouldCache) {
      countrySelectOptions = this.storage.get("addressCountrySelectOptions");

      if (countrySelectOptions) {
        this.set("countrySelectOptions", countrySelectOptions);
        return countrySelectOptions;
      }
    }

    yield this.http
      .fetch(`${this.http.endpoint}address/address/countries/selectoptions`)
      .then((response) => {
        return response.json().then((data) => {
          countrySelectOptions = <SelectOption[]>data;
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    this.set("countrySelectOptions", countrySelectOptions);

    if (this.shouldCache) {
      this.storage.set("addressCountrySelectOptions", countrySelectOptions);
    }

    return countrySelectOptions;
  }

  /**
   * Fetches the address format from the back-end.
   * @param countryCode The countrycode you want the format for
   */
  @enqueueTask
  *getAddressFormat(countryCode: string): any {
    const storageKey = `addressFormat${countryCode}`;

    // We might have already fetched this, so lets check here
    if (this.addressFormats.has(storageKey)) {
      return this.addressFormats.get(storageKey);
    }

    // Maybe in the local storage
    let foundAddressFormat = undefined;
    if (this.shouldCache) {
      // We check the localstorage for the format, we might have it already
      foundAddressFormat = this.storage.get(storageKey);

      if (foundAddressFormat) {
        this.addressFormats.set(storageKey, foundAddressFormat);
        return foundAddressFormat;
      }
    }

    yield this.http
      .fetch(`${this.http.endpoint}address/address/format/${countryCode}`)
      .then((response) => {
        return response.json().then((data) => {
          foundAddressFormat = data;
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    this.addressFormats.set(storageKey, foundAddressFormat);

    if (this.shouldCache) {
      this.storage.set(storageKey, foundAddressFormat);
    }

    return foundAddressFormat;
  }

  /**
   * Returns the select options for a subdivision.
   * @param parentGrouping The grouping you want the subdivision for. This can be the Country code, the city code, the state code, ... You can find this in the format
   */
  @enqueueTask
  *getSubdivisionSelectOptions(parentGrouping: string) {
    const cacheKey =
      "addressSubdivisionSelectOptions" + replaceAll(parentGrouping, ",", "");

    // We might have already fetched this, so lets check here first
    if (this.subdivisionSelectOptions.has(cacheKey)) {
      return this.subdivisionSelectOptions.get(cacheKey);
    }

    // Maybe in the local storage
    let selectoptions: SelectOption[] = [];
    if (this.shouldCache) {
      selectoptions = this.storage.get(cacheKey);

      if (selectoptions) {
        this.subdivisionSelectOptions.set(cacheKey, selectoptions);
        return selectoptions;
      } else {
        selectoptions = [];
      }
    }

    yield this.http
      .fetch(
        `${this.http.endpoint}address/address/subdivisions/${parentGrouping}`
      )
      .then((response) => {
        return response.json().then((body) => {
          if (!isBlank(body) && !isBlank(body.data)) {
            for (let subdivision of body.data) {
              const selectoption: SelectOption = {
                value: subdivision.attributes["code"],
                label: subdivision.attributes["name"],
              };

              if (!isBlank(subdivision.attributes["local-name"])) {
                selectoption.label += ` (${subdivision.attributes["local-name"]})`;
              }

              selectoptions.push(selectoption);
            }
          }
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    this.subdivisionSelectOptions.set(cacheKey, selectoptions);

    if (this.shouldCache) {
      this.storage.set(cacheKey, selectoptions);
    }

    return selectoptions;
  }
}
