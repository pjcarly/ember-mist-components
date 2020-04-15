import Service from "@ember/service";

export interface Headers {
  "X-Mist-Auth-Token": string;
  "X-Mist-Auth-Id": string;
}

export default class AuthStoreService extends Service {
  authId?: string;
  authToken?: string;

  clear() {
    this.set("authId", undefined);
    this.set("authToken", undefined);
  }
}
