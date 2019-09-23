import Service from "@ember/service";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { computed } from "@ember/object";
import { dropTask } from "ember-concurrency-decorators";
import { timeout } from "ember-concurrency";
import Evented from "@ember/object/evented";
import { debug } from "@ember/debug";
import { isArray } from "@ember/array";
import { getOwner } from "@ember/application";

export enum Status {
  OFFLINE = "OFFLINE",
  CONNECTING = "CONNECTING",
  ONLINE = "ONLINE"
}

export default class WebsocketService extends Service.extend(Evented) {
  @service websockets!: any;
  @service session!: Service;

  socket!: any;
  status: string = Status.OFFLINE;
  reconnectAttempts: number = 0;
  manuallyClosed: boolean = false;

  @alias("session.data.authenticated.access_token") accessToken!: string;

  @computed
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @computed("config")
  get endpoint(): string | undefined | null {
    return this.config.websocketHost;
  }

  @dropTask
  *startConnecting() {
    this.set("manuallyClosed", false);

    if (this.endpoint) {
      while (
        !this.manuallyClosed &&
        (!this.socket || !this.websockets.isWebSocketOpen(this.socket.socket))
      ) {
        if (this.reconnectAttempts > 0) {
          const exponent =
            this.reconnectAttempts < 6 ? this.reconnectAttempts : 6;
          let waitFor = Math.pow(2, exponent) * 1000;

          debug(
            `Attempting to reconnect (${this.reconnectAttempts}) in ${waitFor /
              1000}s`
          );

          yield timeout(waitFor);
        }

        this.openConnection();
        this.incrementProperty("reconnectAttempts");
      }
    }
  }

  /**
   * Opens the connection to the websocket endpoint
   */
  openConnection() {
    this.set("status", Status.CONNECTING);

    let socket = this.socket;

    if (!socket) {
      socket = this.websockets.socketFor(
        `${this.endpoint}?access_token=${this.accessToken}`
      );

      socket.on("open", this.connectionOpened, this);
      socket.on("message", this.messageReceived, this);
      socket.on("close", this.connectionClosed, this);
      socket.on("error", this.connectionErrored, this);
    } else {
      socket.reconnect();
    }

    this.set("socket", socket);
  }

  /**
   * Closes the connection to the websocket endpoint
   */
  closeConnection() {
    if (this.endpoint && this.socket) {
      this.set("manuallyClosed", true);
      this.set("status", Status.CONNECTING);
      this.socket.close();
    }
  }

  connectionOpened(_: any) {
    this.set("status", Status.ONLINE);
    this.reconnectAttempts = 0;
  }

  messageReceived(event: any) {
    if (event.data) {
      const payload = JSON.parse(event.data);
      if (payload.data && !isArray(payload.data)) {
        if (payload.data.type) {
          this.trigger("message", payload);
        }
      }
    }
  }

  connectionClosed(_: any) {
    this.set("status", Status.OFFLINE);
    if (!this.manuallyClosed) {
      this.startConnecting.perform();
    }
  }

  connectionErrored(_: any) {
    this.set("status", Status.OFFLINE);
    this.startConnecting.perform();
  }
}
