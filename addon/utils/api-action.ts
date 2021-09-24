import { getOwner } from "@ember/application";
import HttpService from "@getflights/ember-mist-components/services/http";
import ModelInterface from "../interfaces/model";

export default function apiAction(path: string) {
  return function runInstanceOp(this: ModelInterface, payload?: any): Promise<Response> {
    const container = getOwner(this);
    const http = <HttpService>container.lookup(`service:http`);
    const url = http.getActionEndpoint(this, path);

    if (payload) {
      payload = JSON.stringify(payload);
    }

    return http.fetch(url, "POST", payload);
  };
}
