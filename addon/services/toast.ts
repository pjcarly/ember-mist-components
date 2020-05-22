import Service from "@ember/service";
import ToastMessage, { MessageType } from "ember-mist-components/objects/toast-message";
import { A } from "@ember/array";
import { getOwner, setOwner } from "@ember/application";
import { task } from "ember-concurrency-decorators";
// @ts-ignore
import { timeout } from "ember-concurrency";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";

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
    setOwner(toast, getOwner(this));
    this.toasts.pushObject(toast);
    taskFor(this.removeToastTimer).perform(toast);
  }

  @task
  *removeToastTimer(toast: ToastMessage) {
    yield timeout(2500);
    this.removeToast(toast);
  }

  removeToast(toast: ToastMessage) {
    this.toasts.removeObject(toast);
  }
}
