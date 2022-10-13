import Component from "@glimmer/component";
import ToastMessage, {
  MessageType,
} from "@getflights/ember-mist-components/objects/toast-message";
import { guidFor } from "@ember/object/internals";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import ToastService from "@getflights/ember-mist-components/services/toast";
import { cached, tracked } from "@glimmer/tracking";
// @ts-ignore
import Toast from "bootstrap.native/dist/components/toast-native.esm.js";

interface Arguments {
  toast: ToastMessage;
}

export default class ToastMessageComponent extends Component<Arguments> {
  // @ts-ignore
  @service("toast") toastService!: ToastService;

  @tracked bootstrapToast?: Toast;

  @cached
  get toastId(): string {
    return `${guidFor(this)}-toast`;
  }

  get class(): string {
    const classes: string[] = [];
    classes.push("toast");

    if (this.args.toast.type === MessageType.SUCCESS) {
      classes.push("toast-success");
    } else if (this.args.toast.type === MessageType.ERROR) {
      classes.push("toast-error");
    } else if (this.args.toast.type === MessageType.INFO) {
      classes.push("toast-info");
    } else if (this.args.toast.type === MessageType.WARNING) {
      classes.push("toast-warning");
    }

    return classes.join(" ");
  }

  get ariaLive(): string {
    if (this.args.toast.type === MessageType.ERROR) {
      return "assertive";
    } else {
      return "polite";
    }
  }

  @action
  elementInsertedInDOM(element: Element) {
    const bootstrapToast = new Toast(element, {
      animation: true,
      autohide: false,
    });
    bootstrapToast.show();
    this.bootstrapToast = bootstrapToast;
  }

  @action
  elementWillBeRemovedFromDOM() {
    if (this.bootstrapToast) {
      this.bootstrapToast.hide();
    }
    this.bootstrapToast = undefined;
  }

  @action
  close() {
    this.toastService.removeToast(this.args.toast);
  }
}
