import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { action, computed } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { getOwner } from '@ember/application';
import { OpenEvent, CloseEvent, ErrorEvent, MessageEvent } from 'ws';
import { taskFor } from 'ember-concurrency-ts';
import SessionService from 'ember-simple-auth/services/session';
import { tracked } from '@glimmer/tracking';

export enum Status {
  OFFLINE = 'OFFLINE',
  CONNECTING = 'CONNECTING',
  ONLINE = 'ONLINE',
}

export enum Event {
  OPEN = 'open',
  CLOSE = 'close',
  ERROR = 'error',
}

export interface MessageBodyInterface {}

export interface MessageInterface {
  meta: {
    type: string;
  };
  data?: MessageBodyInterface;
}

export default class WebsocketService extends Service {
  @service websockets!: any;
  @service session!: SessionService;

  @tracked socket?: any;
  @tracked status: string = Status.OFFLINE;
  @tracked manuallyClosed: boolean = false;
  @tracked reconnectAttempts: number = 0;

  private subscriptions = new Map<Event, Set<() => void>>();
  private messageSubscriptions = new Map<
    string,
    Set<(message: MessageInterface) => void>
  >();

  @alias('session.data.authenticated.access_token')
  accessToken!: string;

  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration('config:environment');
  }

  get endpoint(): string | undefined | null {
    return this.config.websocketHost;
  }

  @dropTask
  public async startConnecting() {
    this.manuallyClosed = false;

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

          await timeout(waitFor);
        }

        this.openConnection();
        this.reconnectAttempts++;
      }
    }
  }

  /**
   * Opens the connection to the websocket endpoint
   */
  public openConnection() {
    this.status = Status.CONNECTING;
    let socket = this.socket;

    if (!socket) {
      if (this.accessToken) {
        socket = this.websockets.socketFor(
          `${this.endpoint}?access_token=${this.accessToken}`
        );
      } else {
        socket = this.websockets.socketFor(this.endpoint);
      }
      socket.on('open', this.connectionOpened);
      socket.on('message', this.messageReceived);
      socket.on('close', this.connectionClosed);
      socket.on('error', this.connectionErrored);
    } else {
      socket.reconnect();
    }

    this.socket = socket;
  }

  /**
   * Closes the connection to the websocket endpoint
   */
  public closeConnection() {
    if (this.endpoint && this.socket) {
      this.manuallyClosed = true;
      this.status = Status.CONNECTING;
      this.socket.close();
    }
  }

  /**
   * Send a message over the socket
   * @param message What message to send over the socket, this will be Json serialized
   */
  public sendMessage(message: MessageInterface) {
    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Subscribe on a certain event with your provided callback, for message use subscribeForMessage()
   * @param event Which event do you want to subscribe for, this can either be Open, Close or Error
   * @param callback What callback to call on the event
   */
  public subscribe(event: Event, callback: () => void) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set<() => void>());
    }

    this.subscriptions.get(event)?.add(callback);
  }

  /**
   * Unsubscribe a callback for a Topic, this is no websocket message, for the message use unsubscribeForMessage()
   * @param event Which event do you want to unsubscribe for this can either be Open, Close or Error
   * @param callback What callback to unsubscribe
   */
  public unsubscribe(event: Event, callback: () => void) {
    if (this.subscriptions.has(event)) {
      this.subscriptions.get(event)?.delete(callback);
    }
  }

  /**
   * Subscribe your callback for a certain message-type
   * @param messageType The message type to subscribe for, this is the information in { meta: type }
   * @param callback The Function to subscribe
   */
  public subscribeForMessage(
    messageType: string,
    callback: (message: MessageInterface) => void
  ) {
    if (!this.messageSubscriptions.get(messageType)) {
      this.messageSubscriptions.set(
        messageType,
        new Set<(message?: MessageInterface) => void>()
      );
    }

    this.messageSubscriptions.get(messageType)?.add(callback);
  }

  /**
   * Unsubscribe your callback for a certain message-type
   * @param messageType The message type to unsubscribe for, this is the information in { meeta: type }
   * @param callback The function to unsubscribe
   */
  public unsubscribeForMessage(
    messageType: string,
    callback: (message: MessageBodyInterface) => void
  ) {
    if (this.messageSubscriptions.has(messageType)) {
      this.messageSubscriptions.get(messageType)?.delete(callback);
    }
  }

  @action
  protected messageReceived(event: MessageEvent) {
    if (event.data) {
      const message = <MessageInterface>JSON.parse(<string>event.data);

      if (message?.meta?.type) {
        this.messageSubscriptions
          .get(message.meta.type)
          ?.forEach((callback) => {
            callback(message);
          });
      }
    }
  }

  @action
  protected connectionOpened(_: OpenEvent) {
    this.status = Status.ONLINE;
    this.reconnectAttempts = 0;
    this.subscriptions.get(Event.OPEN)?.forEach((callback) => {
      callback();
    });
  }

  @action
  protected connectionClosed(_: CloseEvent) {
    this.status = Status.OFFLINE;
    if (!this.manuallyClosed) {
      taskFor(this.startConnecting).perform();
    }
    this.subscriptions.get(Event.CLOSE)?.forEach((callback) => {
      callback();
    });
  }

  @action
  protected connectionErrored(_: ErrorEvent) {
    this.status = Status.OFFLINE;
    taskFor(this.startConnecting).perform();

    this.subscriptions.get(Event.ERROR)?.forEach((callback) => {
      callback();
    });
  }
}
