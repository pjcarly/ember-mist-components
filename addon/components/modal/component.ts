import Component from "@glimmer/component";
import { action, computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
// @ts-ignore
import Modal from "bootstrap.native/dist/components/modal-native.esm.js";
import type RouterService from '@ember/routing/router-service';
import Transition from "@ember/routing/-private/transition";

export interface YieldedComponent {
  /**
   * Close the modal window
   */
  close: CallableFunction;

  /**
   * Open the modal window
   */
  show: CallableFunction;

  /**
   * Status of the Modal window, "visible" when it is shown, "hidden" when it is not shown
   */
  status: "visible" | "hidden";
}

export interface Arguments {
  dialogClass?: string;
  closeOnRouteChange?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export default class ModalComponent<T extends Arguments> extends Component<T> {
  @service router!: RouterService;

  @tracked private modalVisible: boolean = false;
  @tracked private modal?: Modal;
  @tracked protected closeOnRouteChange = false;

  constructor(owner: any, args: T) {
    super(owner, args);

    if (args.closeOnRouteChange) {
      this.closeOnRouteChange = args.closeOnRouteChange;
    }

    if (this.closeOnRouteChange) {
      this.router.on("routeWillChange", (_: Transition) => {
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

  getModal(): Modal {
    if (!this.modal) {
      const element = document.getElementById(this.modalId);
      if (element) {
        const modal = new Modal(element);
        element.addEventListener("hidden.bs.modal", this.hideModalListener);
        this.modal = modal;
      }
    }

    return <Modal>this.modal;
  }

  @action
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

  @action
  elementWillBeRemovedFromDOM(element: Element) {
    element.removeEventListener("hidden.bs.modal", this.hideModalListener);
  }
}
