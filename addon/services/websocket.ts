import Service from "@ember/service";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { computed } from "@ember/object";
import { dropTask } from "ember-concurrency-decorators";
import { timeout } from "ember-concurrency";
import Evented from "@ember/object/evented";
import { debug } from "@ember/debug";
import { getOwner } from "@ember/application";
import { OpenEvent, CloseEvent, ErrorEvent, MessageEvent } from "ws";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";
import SessionService from "ember-simple-auth/services/session";

export enum Status {
  OFFLINE = "OFFLINE",
  CONNECTING = "CONNECTING",
  ONLINE = "ONLINE",
}

export default class WebsocketService extends Service.extend(Evented) {
  @service websockets!: any;
  @service session!: SessionService;

  socket!: any;
  status: string = Status.OFFLINE;
  reconnectAttempts: number = 0;
  manuallyClosed: boolean = false;

  @alias("session.data.authenticated.access_token") accessToken!: string;

  @computed()
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
            `Attempting to reconnect (${this.reconnectAttempts}) in ${
              waitFor / 1000
            }s`
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
      if (this.accessToken) {
        socket = this.websockets.socketFor(
          `${this.endpoint}?access_token=${this.accessToken}`
        );
      } else {
        socket = this.websockets.socketFor(this.endpoint);
      }
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

  connectionOpened(_: OpenEvent) {
    this.set("status", Status.ONLINE);
    this.reconnectAttempts = 0;
  }

  messageReceived(event: MessageEvent) {
    if (event.data) {
      // @ts-ignore
      this.trigger("message", event.data);
    }
  }

  connectionClosed(_: CloseEvent) {
    this.set("status", Status.OFFLINE);
    if (!this.manuallyClosed) {
      taskFor(this.startConnecting).perform();
    }
  }

  connectionErrored(_: ErrorEvent) {
    this.set("status", Status.OFFLINE);
    taskFor(this.startConnecting).perform();
  }

  sendMessage(message: any) {
    this.socket.send(message);
  }
}
