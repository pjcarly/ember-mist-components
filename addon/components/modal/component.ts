import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { tagName } from "@ember-decorators/component";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import { guidFor } from "@ember/object/internals";

@tagName("")
export default class ModalComponent extends Component {
  modalVisible: boolean = false;
  modal?: bsn.Modal;

  // didInsertElement() {
  //   super.didInsertElement();
  //   const element = document.getElementById("ember-mist-modal-wormhole");

  //   if (element) {
  //     element.addEventListener(
  //       "shown.bs.modal",
  //       (event) => {
  //         console.log(event);
  //       },
  //       false
  //     );
  //     element.addEventListener(
  //       "hidden.bs.modal",
  //       (event) => {
  //         console.log(event);
  //       },
  //       false
  //     );
  //   }
  // }

  // willDestroyElement() {
  //   const element = document.getElementById("ember-mist-modal-wormhole");

  //   if (element) {
  //     element.removeEventListener(
  //       "show.bs.modal",
  //       (event) => {
  //         console.log(event);
  //       },
  //       false
  //     );
  //     element.removeEventListener(
  //       "hidden.bs.modal",
  //       (event) => {
  //         console.log(event);
  //       },
  //       false
  //     );
  //   }

  //   super.willDestroyElement();
  // }

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
  get modalTriggerId(): string {
    return `${this.modalId}-trigger`;
  }

  @computed("modalVisible")
  get status(): string {
    return this.modalVisible ? "visible" : "hidden";
  }

  getModal() {
    if (!this.modal) {
      const element = document.getElementById(this.modalId);
      const modal = new bsn.Modal(element, {});
      this.set("modal", modal);
    }

    return this.modal;
  }

  @action
  closeModal() {
    this.set("modalVisible", false);
    this.getModal().hide();
  }

  @action
  showModal() {
    this.set("modalVisible", true);
    this.getModal().show();
  }
}
