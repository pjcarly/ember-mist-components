import Model from "@ember-data/model";
import { getOwner } from "@ember/application";
import FieldInformationService from "@getflights/ember-field-components/services/field-information";
import HttpService from "@getflights/ember-mist-components/services/http";
import Store from "@ember-data/store";

export default function apiAction(path: string) {
  return function runInstanceOp(this: Model, payload?: any): Promise<any> {
    const container = getOwner(this);
    const fieldInformation = <FieldInformationService>(
      container.lookup(`service:field-information`)
    );
    const http = <HttpService>container.lookup(`service:http`);
    const store = <Store>container.lookup(`service:store`);
    const modelName = fieldInformation.getModelName(this);
    // @ts-ignore
    const adapter = store.adapterFor(modelName);
    // @ts-ignore
    const baseURL = adapter.buildURL(
      modelName,
      this.id,
      // @ts-ignore
      this._createSnapshot()
    );
    let url = baseURL;

    if (path) {
      if (baseURL.charAt(baseURL.length - 1) === "/") {
        url = `${baseURL}${path}`;
      } else {
        url = `${baseURL}/${path}`;
      }
    }

    if (payload) {
      payload = JSON.stringify(payload);
    }

    return http.fetch(url, "POST", payload);
  };
}
