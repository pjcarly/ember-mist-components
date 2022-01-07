import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { getOwner } from '@ember/application';
import { OpenEvent, CloseEvent, ErrorEvent, MessageEvent } from 'ws';
import { taskFor } from 'ember-concurrency-ts';
import SessionService from 'ember-simple-auth/services/session';
import { cached, tracked } from '@glimmer/tracking';

export enum Status {
  OFFLINE = 'OFFLINE',
  CONNECTING = 'CONNECTING',
  ONLINE = 'ONLINE',
  AUTHENTICATED = 'AUTHENTICATED'
}

export enum Event {
  OPEN = 'open',
  CLOSE = 'close',
  ERROR = 'error',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export interface MessageBodyInterface {
  type: string;
  id?: string | number;
  attributes?: {
    [key: string]: any;
  };
  relationships?: {
    [key: string]: {
      data: {
        type: string;
        id: string | number;
      };
    };
  };
}

export interface MessageInterface {
  meta: {
    type: string;
  };
  data?: MessageBodyInterface | MessageBodyInterface[];
}

export default class WebsocketService extends Service {
  @service websockets!: any;
  @service session!: SessionService;

  @tracked socket?: any;
  @tracked status: string = Status.OFFLINE;
  @tracked manuallyClosed: boolean = false;
  @tracked connectionSuspended: boolean = false;
  @tracked authenticateAutomatically = true;
  @tracked reconnectAttempts: number = 0;

  private subscriptions = new Map<Event, Set<() => void>>();
  private messageSubscriptions = new Map<
    string,
    Set<(message: MessageInterface) => void>
  >();

  constructor() {
    super(...arguments);

    this.session.on('authenticationSucceeded', this.sessionAuthenticated);
    this.subscribe(Event.OPEN, this.sessionAuthenticated);
    this.subscribeForMessage('authenticated', this.websocketAuthenticated);
    this.subscribeForMessage('unauthenticated', this.websocketUnAuthenticated);
    this.listenForInactivePage();
  }

  private shouldSuspendConnectionWhenIdle(): boolean {
    return !this.session.isAuthenticated &&
      (this.config['ember-mist-components']?.suspendWebsocketWhenIdle ?? false);
  }

  @cached
  get config(): any {
    return getOwner(this).resolveRegistration('config:environment');
  }

  get endpoint(): string | undefined | null {
    return this.config.websocketHost;
  }

  private listenForInactivePage() {
    if (this.shouldSuspendConnectionWhenIdle()) {
      document.addEventListener('visibilitychange', this.inactivePageChanged.bind(this));
    } else {
      document.removeEventListener('visibilitychange', this.inactivePageChanged.bind(this));
    }
  }

  private inactivePageChanged() {
    if (document.visibilityState === 'hidden') {
      this.suspendConnection();
    } else {
      taskFor(this.startConnecting).perform();
    }
  }

  @dropTask
  public async startConnecting() {
    this.manuallyClosed = false;
    this.connectionSuspended = false;

    if (this.endpoint) {
      while (
        !this.manuallyClosed && !this.connectionSuspended &&
        (!this.socket || !this.websockets.isWebSocketOpen(this.socket.socket))
      ) {
        if (this.reconnectAttempts > 0) {
          const exponent =
            this.reconnectAttempts < 6 ? this.reconnectAttempts : 6;
          let waitFor = Math.pow(2, exponent) * 1000;

          debug(
            `Attempting to reconnect (${this.reconnectAttempts}) in ${waitFor / 1000
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
      socket = this.websockets.socketFor(this.endpoint);
      socket.on('open', this.connectionOpened);
      socket.on('message', this.messageReceived);
      socket.on('close', this.connectionClosed);
      socket.on('error', this.connectionErrored);
      this.socket = socket;
    } else {
      socket.reconnect();
    }
  }

  /**
   * Closes the connection to the websocket endpoint
   */
  public closeConnection() {
    if (this.endpoint && this.socket) {
      this.connectionSuspended = false;
      this.manuallyClosed = true;
      this.status = Status.CONNECTING;
      this.socket.close();
    }
  }

  private suspendConnection() {
    if (this.endpoint && this.socket) {
      this.manuallyClosed = false;
      this.connectionSuspended = true;
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
    callback: (message: MessageInterface) => void
  ) {
    if (this.messageSubscriptions.has(messageType)) {
      this.messageSubscriptions.get(messageType)?.delete(callback);
    }
  }

  /**
   * This method sends the authenticate message over the socket
   * In order to have the connection authenticated.
   * This only works when an authenticated session & access_token is present
   * And the websocket connection is open
   */
  public authenticate(): void {
    if (
      this.session.data?.authenticated.access_token &&
      this.status === Status.ONLINE
    ) {
      const message: AuthenticateMessage = {
        meta: {
          type: 'authenticate',
        },
        data: {
          type: 'authentication-message',
          attributes: {
            type: 'bearer',
            authorization: this.session.data.authenticated.access_token,
          },
        },
      };

      this.sendMessage(message);
    }
  }

  /**
   * Unauthenticates the websocket connection
   */
  public unauthenticate(): void {
    const message: UnAuthenticateMessage = {
      meta: {
        type: 'unauthenticate',
      },
    };

    this.sendMessage(message);
  }

  @action
  protected websocketAuthenticated(_message: AuthenticatedMessage) {
    this.status = Status.AUTHENTICATED;
    this.subscriptions.get(Event.AUTHENTICATED)?.forEach((callback) => {
      callback();
    });

    this.listenForInactivePage();
  }

  @action
  protected websocketUnAuthenticated(_message: UnAuthenticatedMessage) {
    this.status = Status.ONLINE;
    this.subscriptions.get(Event.UNAUTHENTICATED)?.forEach((callback) => {
      callback();
    });

    this.listenForInactivePage();
  }

  /**
   * Callback that will be invoked when the session service successfully authenticates
   * This way we can check if we need to authenticate over the socket
   */
  @action
  protected sessionAuthenticated() {
    if (this.authenticateAutomatically) {
      this.authenticate();
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
    if (!this.manuallyClosed && !this.connectionSuspended) {
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

export interface UnAuthenticateMessage extends MessageInterface {
  meta: {
    type: 'unauthenticate';
  };
}

export interface AuthenticateMessage extends MessageInterface {
  data: AuthenticateMessageBody;
  meta: {
    type: 'authenticate';
  };
}

export interface AuthenticateMessageBody extends MessageBodyInterface {
  attributes: {
    authorization: string;
    type: 'bearer';
  };
}

export interface AuthenticatedMessage extends MessageInterface {
  meta: {
    type: 'authenticated';
  };
}

export interface UnAuthenticatedMessage extends MessageInterface {
  meta: {
    type: 'unauthenticated';
  };
}
