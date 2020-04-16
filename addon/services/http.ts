import Service from "@ember/service";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
// @ts-ignore
import fetch from "fetch";
import { Promise } from "rsvp";
import qs from "qs";
import AuthStoreService from "ember-mist-components/services/auth-store";

export default class HttpService extends Service {
  @service session!: Service;
  @service authStore!: AuthStoreService;

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
  @computed(
    "session.data.authenticated.access_token",
    "authStore.{authToken,authId}"
  )
  get headers() {
    const headers: any = {};
    // @ts-ignore
    const access_token = this.session.get("data.authenticated.access_token");

    if (access_token) {
      headers["Authorization"] = `Bearer ${access_token}`;
    }

    if (this.authStore.authId) {
      headers["X-Mist-Auth-Id"] = this.authStore.authId;
    }

    if (this.authStore.authToken) {
      headers["X-Mist-Auth-Token"] = this.authStore.authToken;
    }

    return headers;
  }
}
