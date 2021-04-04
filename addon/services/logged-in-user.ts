import Service from "@ember/service";
import Store from "@ember-data/store";
import Query from "@getflights/ember-mist-components/query/Query";
import UserModel from "@getflights/ember-mist-components/models/user";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { dropTask } from "ember-concurrency-decorators";
import WebsocketService from "./websocket";
import { taskFor } from "ember-concurrency-ts";
import SessionService from "ember-simple-auth/services/session";
import { tracked } from "@glimmer/tracking";

export default class LoggedInUserService extends Service {
  @service session!: SessionService;
  @service store!: Store;
  @service websocket!: WebsocketService;

  /**
   * A reference to the logged in user model
   */
  @tracked user?: UserModel;

  @alias("session.isAuthenticated") isAuthenticated!: boolean;

  /**
   * Loads the current user from the store, based on the user_id in the OAuth response
   * @param query Query Params where possible include query parameter will be taken from
   */
  @dropTask
  async loadCurrentUser(query?: Query) {
    const userId = this.session.data?.authenticated.user_id;

    if (userId) {
      let options: any = {};

      if (query) {
        options = query.queryParams;
      }

      if (this.user) {
        this.user.rollback();
      }

      await this.store
        // @ts-ignore
        .loadRecord("user", userId, options)
        .then((user: UserModel) => {
          this.user = user;
        })
        .catch((_: any) => {
          this.logOut();
        });
    }
  }

  @dropTask
  async signOut() {
    this.websocket.unauthenticate();
    await this.session.invalidate();
    this.user = undefined;
    this.store.unloadAll("user");
  }

  /**
   * Invalidates the session, and unsets the user
   */
  logOut() {
    taskFor(this.signOut).perform();
  }
}
