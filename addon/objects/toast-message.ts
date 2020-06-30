import { tracked } from "@glimmer/tracking";

export enum MessageType {
  ERROR = "error",
  INFO = "info",
  SUCCESS = "success",
  WARNING = 'warning'
}

export default class ToastMessage {
  @tracked subject !: string;
  @tracked message?: string;
  @tracked type !: MessageType;

  constructor(type: MessageType, subject: string, message?: string) {
    this.type = type;
    this.subject = subject;
    this.message = message;
  }
}