import Component from "@ember/component";
import { action } from "@ember/object";
import { tagName } from "@ember-decorators/component";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";

@tagName("")
export default class ModalComponent extends Component {
  modalVisible: boolean = true;
  modalDisplay?: string;
  modal?: bsn.Modal;

  getModal() {
    if (!this.modal) {
      const element = document.getElementById("quote-modal");
      const modal = new bsn.Modal(element, {});
      this.set("modal", modal);
    }

    return this.modal;
  }

  @action
  closeModal() {
    this.getModal().hide();
  }

  @action
  showModal() {
    this.getModal().show();
  }

  @action
  acceptQuote() {
    this.set("modalDisplay", "quote-accept");
    this.showModal();
  }

  @action
  rejectQuote() {
    this.set("modalDisplay", "quote-reject");
    this.showModal();
  }
}
