import Service from "@ember/service";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";
import { inject as service } from "@ember/service";
import { enqueueTask } from "ember-concurrency";
import { getOwner } from "@ember/application";
import { replaceAll } from "@getflights/ember-field-components/classes/utils";
import { isBlank } from "@ember/utils";
import HttpService from "./http";
import { cached, tracked } from "@glimmer/tracking";
import StorageService from '@getflights/ember-mist-components/services/storage';

export default class AddressService extends Service {
  @service storage!: StorageService;
  @service http!: HttpService;

  /**
   * Define a default country that can be used in input forms throughout your application
   */
  @tracked defaultCountry?: string;
  @tracked countrySelectOptions?: SelectOption[];
  addressFormats: Map<string, any> = new Map();
  subdivisionSelectOptions: Map<string, SelectOption[]> = new Map();

  get apiEndpoint(): string {
    return this.config.apiEndpoint;
  }

  @cached
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @cached
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
  async getCountrySelectOptions() {
    // We first check in this service
    let countrySelectOptions = this.countrySelectOptions;
    if (countrySelectOptions && Array.isArray(countrySelectOptions) && countrySelectOptions.length > 0) {
      return countrySelectOptions;
    }

    // We check the localstorage cache
    if (this.shouldCache) {
      countrySelectOptions = this.storage.retrieve("addressCountrySelectOptions");

      if (countrySelectOptions) {
        this.countrySelectOptions = countrySelectOptions;
        return countrySelectOptions;
      }
    }

    await this.http
      .fetch(`${this.http.endpoint}address/countries/selectoptions`)
      .then((response) => {
        return response.json().then((data) => {
          countrySelectOptions = <SelectOption[]>data;
        });
      })
      .catch((error: any) => {
        console.log(error);
      });

    this.countrySelectOptions = countrySelectOptions;

    if (this.shouldCache) {
      this.storage.persist("addressCountrySelectOptions", countrySelectOptions);
    }

    return countrySelectOptions;
  }

  /**
   * Fetches the address format from the back-end.
   * @param countryCode The countrycode you want the format for
   */
  @enqueueTask
  async getAddressFormat(countryCode: string): Promise<any> {
    const storageKey = `addressFormat${countryCode}`;

    // We might have already fetched this, so lets check here
    if (this.addressFormats.has(storageKey)) {
      return this.addressFormats.get(storageKey);
    }

    // Maybe in the local storage
    let foundAddressFormat = undefined;
    if (this.shouldCache) {
      // We check the localstorage for the format, we might have it already
      foundAddressFormat = this.storage.retrieve(storageKey);

      if (foundAddressFormat) {
        this.addressFormats.set(storageKey, foundAddressFormat);
        return foundAddressFormat;
      }
    }

    await this.http
      .fetch(`${this.http.endpoint}address/format/${countryCode}`)
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
      this.storage.persist(storageKey, foundAddressFormat);
    }

    return foundAddressFormat;
  }

  /**
   * Returns the select options for a subdivision.
   * @param parentGrouping The grouping you want the subdivision for. This can be the Country code, the city code, the state code, ... You can find this in the format
   */
  @enqueueTask
  async getSubdivisionSelectOptions(parentGrouping: string) {
    const cacheKey =
      "addressSubdivisionSelectOptions" + replaceAll(parentGrouping, ",", "");

    // We might have already fetched this, so lets check here first
    if (this.subdivisionSelectOptions.has(cacheKey)) {
      return this.subdivisionSelectOptions.get(cacheKey);
    }

    // Maybe in the local storage
    let selectoptions: SelectOption[] = [];
    if (this.shouldCache) {
      selectoptions = this.storage.retrieve(cacheKey);

      if (selectoptions) {
        this.subdivisionSelectOptions.set(cacheKey, selectoptions);
        return selectoptions;
      } else {
        selectoptions = [];
      }
    }

    await this.http
      .fetch(
        `${this.http.endpoint}address/subdivisions/${parentGrouping}`
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
      this.storage.persist(cacheKey, selectoptions);
    }

    return selectoptions;
  }
}
