import Component from "@glimmer/component";
import { action, computed } from "@ember/object";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import { guidFor } from "@ember/object/internals";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export interface YieldedComponent {
  close: CallableFunction;
  show: CallableFunction;
  status: "visible" | "hidden";
}

interface Arguments {
  dialogClass?: string;
  closeOnRouteChange?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export default class ModalComponent extends Component<Arguments> {
  @service router!: any;

  @tracked private modalVisible: boolean = false;
  @tracked private modal?: bsn.Modal;

  constructor(owner: any, args: Arguments) {
    super(owner, args);

    if (this.args.closeOnRouteChange) {
      this.router.on("routeWillChange", (_: TransitionEvent) => {
        this.closeModal();
      });
    }
  }

  get dialogClass(): string {
    return this.args.dialogClass ?? "modal-dialog-centered";
  }

  @computed()
  get modalId(): string {
    return `${guidFor(this)}-modal`;
  }

  get modalBodyId(): string {
    return `${this.modalId}-body`;
  }

  get modalHeaderId(): string {
    return `${this.modalId}-header`;
  }

  get modalFooterId(): string {
    return `${this.modalId}-footer`;
  }

  get modalContentId(): string {
    return `${this.modalId}-content`;
  }

  get modalTriggerId(): string {
    return `${this.modalId}-trigger`;
  }

  @computed("modalVisible")
  get status(): string {
    return this.modalVisible ? "visible" : "hidden";
  }

  getModal(): bsn.Modal {
    if (!this.modal) {
      const element = document.getElementById(this.modalId);
      if (element) {
        const modal = new bsn.Modal(element);
        element.addEventListener(
          "hidden.bs.modal",
          this.hideModalListener.bind(this)
        );
        this.modal = modal;
      }
    }

    return this.modal;
  }

  hideModalListener() {
    this.modalVisible = false;
    if (this.args.onClose) {
      this.args.onClose();
    }
  }

  @action
  closeModal() {
    if (this.modalVisible) {
      this.getModal().hide();
    }
  }

  @action
  showModal() {
    if (!this.modalVisible) {
      this.modalVisible = true;
      this.getModal().show();
      if (this.args.onOpen) {
        this.args.onOpen();
      }
    }
  }

  elementWillBeRemovedFromDOM(element: Element) {
    element.removeEventListener("hidden.bs.modal", this.hideModalListener);
  }
}
