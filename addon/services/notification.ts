import Service from "@ember/service";
import WebsocketService from "./websocket";
import Evented from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { assert } from "@ember/debug";

export default abstract class NotificationService extends Service.extend(
  Evented
) {
  @service websocket!: WebsocketService;

  init() {
    // @ts-ignore
    super.init(...arguments);
    this.websocket.on("message", this, this.triggerNotification);
  }

  triggerNotification(_: any): void {
    assert(
      "No implementation added, you must override `triggerNotification` in your service implementation"
    );
  }
}
