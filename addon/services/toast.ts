import Service from "@ember/service";

export default class ToastService extends Service {
  success(subject: string, message: string) {}
  info(subject: string, message: string) {}
  error(subject: string, message: string) {}
}
