import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { tagName } from "@ember-decorators/component";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import { guidFor } from "@ember/object/internals";
import { inject as service } from "@ember/service";

export interface YieldedComponent {
  close: CallableFunction;
  show: CallableFunction;
  status: "visible" | "hidden"
}

@tagName("")
export default class ModalComponent extends Component {
  @service router!: any;

  modalVisible: boolean = false;
  closeOnRouteChange: boolean = false;
  modal?: bsn.Modal;

  dialogClass = "modal-dialog-centered";
  onOpen() {}
  onClose() {}

  didReceiveAttrs() {
    // @ts-ignore
    super.didReceiveAttrs(...arguments);

    if (this.closeOnRouteChange) {
      this.router.on("routeWillChange", (_: TransitionEvent) => {
        this.closeModal();
      });
    }
  }

  @computed()
  get modalId(): string {
    return `${guidFor(this)}-modal`;
  }

  @computed("modalId")
  get modalBodyId(): string {
    return `${this.modalId}-body`;
  }

  @computed("modalId")
  get modalHeaderId(): string {
    return `${this.modalId}-header`;
  }

  @computed("modalId")
  get modalFooterId(): string {
    return `${this.modalId}-footer`;
  }

  @computed("modalId")
  get modalContentId(): string {
    return `${this.modalId}-content`;
  }

  @computed("modalId")
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
        this.set("modal", modal);
      }
    }

    return this.modal;
  }

  hideModalListener() {
    this.set("modalVisible", false);
    this.onClose();
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
      this.set("modalVisible", true);
      this.getModal().show();
      this.onOpen();
    }
  }

  willDestroyElement() {
    const element = document.getElementById(this.modalId);
    if (element) {
      element.removeEventListener("hidden.bs.modal", this.hideModalListener);
    }

    // @ts-ignore
    super.willDestroyElement(...arguments);
  }
}
