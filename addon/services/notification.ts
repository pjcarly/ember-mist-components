import Service from '@ember/service';
import WebsocketService, {
  MessageBodyInterface,
  MessageInterface,
} from './websocket';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export enum MessageType {
  NOTIFICATION = 'notification',
}

export interface NotificationMessage extends MessageInterface {
  data: NotificationMessageBody;
  meta: {
    type: MessageType.NOTIFICATION;
  };
}

export interface NotificationMessageBody extends MessageBodyInterface {
  id: string | number;
  attributes: {
    [key: string]: any;
  };
}

export default abstract class NotificationService extends Service {
  @service websocket!: WebsocketService;

  private subscriptions = new Map<
    string,
    Set<(message: NotificationMessage) => void>
  >();

  init() {
    // @ts-ignore
    super.init(...arguments);
    this.websocket.subscribeForMessage(
      MessageType.NOTIFICATION,
      this.triggerNotification
    );
  }

  public subscribe(
    type: string,
    callback: (message: NotificationMessage) => void
  ) {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(
        type,
        new Set<(message: NotificationMessage) => void>()
      );
    }

    this.subscriptions.get(type)?.add(callback);
  }

  public unsubscribe(
    type: string,
    callback: (message: NotificationMessage) => void
  ) {
    if (this.subscriptions.has(type)) {
      this.subscriptions.get(type)?.delete(callback);
    }
  }

  @action
  public triggerNotification(message: NotificationMessage): void {
    if (message?.data?.type) {
      this.subscriptions.get(message.data.type)?.forEach((callback) => {
        callback(message);
      });
    }
  }
}
