import Service from "@ember/service";
import Store from "ember-data/store";
import Query from "ember-mist-components/query/Query";
import UserModel from "ember-mist-components/models/user";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { dropTask } from "ember-concurrency-decorators";
import WebsocketService from "./websocket";

interface SessionService {
  invalidate(): void;
  get(key: string): any;
}

export default class LoggedInUserService extends Service {
  @service session!: SessionService;
  @service store!: Store;
  @service websocket!: WebsocketService;

  /**
   * A reference to the logged in user model
   */
  user?: UserModel;

  @alias("session.isAuthenticated") isAuthenticated!: boolean;

  /**
   * Loads the current user from the store, based on the user_id in the OAuth response
   * @param query Query Params where possible include query parameter will be taken from
   */
  @dropTask
  *loadCurrentUser(query?: Query) {
    const userId = this.session.get("data.authenticated.user_id");
    let options: any = {};

    if (query) {
      options = query.queryParams;
    }

    if (this.user) {
      this.user.rollback();
    }

    yield this.store
      .loadRecord("user", userId, options)
      .then((user: UserModel) => {
        this.set("user", user);
        this.websocket.startConnecting.perform();
      })
      .catch((_: any) => {
        this.logOut();
      });
  }

  /**
   * Invalidates the session, and unsets the user
   */
  logOut() {
    this.set("user", null);
    this.session.invalidate();
    this.websocket.closeConnection();
  }
}
