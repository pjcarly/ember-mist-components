import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";

export interface Headers {
  "X-Mist-Auth-Token": string;
  "X-Mist-Auth-Id": string;
}

export default class AuthStoreService extends Service {
  @tracked authId?: string;
  @tracked authToken?: string;

  clear() {
    this.authId = undefined;
    this.authToken = undefined;
  }
}
