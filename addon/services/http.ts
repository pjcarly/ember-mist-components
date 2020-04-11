import Service from "@ember/service";
import { isBlank } from "@ember/utils";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
import fetch from "fetch";
import { Promise } from "rsvp";
import qs from "qs";

export default class HttpService extends Service {
  @service session!: Service;

  fetch(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "OPTIONS" | "DELETE" = "GET",
    body?: any,
    queryParams?: any
  ): Promise<Response> {
    const options: RequestInit = {
      headers: this.headers,
      method: method,
      body: body,
    };

    const endpoint = queryParams
      ? `${path}?${qs.stringify(queryParams)}`
      : path;
    return new Promise(function (resolve, reject) {
      return fetch(endpoint, options)
        .then((response: any) => {
          if (response.ok) {
            resolve(response);
          } else {
            reject(response);
          }
        })
        .catch((reason: any) => {
          reject(reason);
        });
    });
  }

  /**
   * We set the host from the config
   */
  @computed()
  get host() {
    const config = getOwner(this).resolveRegistration("config:environment");
    return config.apiHost;
  }

  /**
   * Get the endpoint from the config
   */
  @computed()
  get endpoint() {
    const config = getOwner(this).resolveRegistration("config:environment");
    return config.apiEndpoint;
  }

  /**
   * We set the authorization header from the session service
   */
  @computed("session.data.authenticated.access_token")
  get headers() {
    const headers: any = {};
    // @ts-ignore
    const access_token = this.session.get("data.authenticated.access_token");

    if (!isBlank(access_token)) {
      headers["Authorization"] = `Bearer ${access_token}`;
    }

    return headers;
  }
}
