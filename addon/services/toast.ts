import Service from "@ember/service";
import ToastMessage, {
  MessageType,
} from "@getflights/ember-mist-components/objects/toast-message";
import { A } from "@ember/array";
import { task } from "ember-concurrency-decorators";
import { timeout } from "ember-concurrency";
import { taskFor } from "ember-concurrency-ts";

export default class ToastService extends Service {
  toasts = A<ToastMessage>();

  success(subject: string, message?: string) {
    const toast = new ToastMessage(MessageType.SUCCESS, subject, message);
    this.addToast(toast);
  }

  info(subject: string, message?: string) {
    const toast = new ToastMessage(MessageType.INFO, subject, message);
    this.addToast(toast);
  }

  error(subject: string, message?: string) {
    const toast = new ToastMessage(MessageType.ERROR, subject, message);
    this.addToast(toast);
  }

  warning(subject: string, message?: string) {
    const toast = new ToastMessage(MessageType.WARNING, subject, message);
    this.addToast(toast);
  }

  private addToast(toast: ToastMessage) {
    this.toasts.pushObject(toast);
    taskFor(this.removeToastTimer).perform(toast);
  }

  @task
  async removeToastTimer(toast: ToastMessage) {
    await timeout(5000);
    this.removeToast(toast);
  }

  removeToast(toast: ToastMessage) {
    this.toasts.removeObject(toast);
  }
}
