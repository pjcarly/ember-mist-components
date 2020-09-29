import Service from "@ember/service";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
// @ts-ignore
import fetch from "fetch";
import { Promise } from "rsvp";
import qs from "qs";
import AuthStoreService from "@getflights/ember-mist-components/services/auth-store";
import SessionService from "ember-simple-auth/services/session";
import JSONAPIAdapter from "@ember-data/adapter/json-api";

export default class HttpService extends Service {
  @service session!: SessionService;
  @service authStore!: AuthStoreService;

  fetch(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "OPTIONS" | "DELETE" = "GET",
    body?:
      | string
      | Blob
      | ArrayBufferView
      | ArrayBuffer
      | FormData
      | URLSearchParams
      | ReadableStream<Uint8Array>
      | null
      | undefined,
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
    return new Promise((resolve, reject) => {
      return fetch(endpoint, options)
        .then((response: Response) => {
          if (response.ok) {
            resolve(response);
          } else {
            this._handleErrorResponse(response, options);
            reject(response);
          }
        })
        .catch((reason: Response) => {
          this._handleErrorResponse(reason, options);
          reject(reason);
        });
    });
  }

  _handleErrorResponse(response: Response, request: RequestInit) {
    const applicationAdapter: JSONAPIAdapter = getOwner(this).lookup(
      "adapter:application"
    );
    applicationAdapter.handleResponse(
      response.status,
      response.headers.values,
      response.text,
      request
    );
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
