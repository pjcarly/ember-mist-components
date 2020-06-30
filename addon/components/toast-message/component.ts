import Component from '@ember/component';
import { tagName } from "@ember-decorators/component";
import ToastMessage, { MessageType } from "ember-mist-components/objects/toast-message";
import { computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";
// @ts-ignore
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ToastService from 'ember-mist-components/services/toast';

@tagName("")
export default class ToastMessageComponent extends Component {
  // @ts-ignore
  @service('toast') toastService !: ToastService;

  toast !: ToastMessage;
  bootstrapToast !: bsn.Toast;

  didInsertElement() {
    // @ts-ignore
    super.didInsertElement(...arguments);

    const element = document.getElementById(this.toastId);
    if (element) {
      const bootstrapToast = new bsn.Toast(element, { animation: true, autohide: false });
      bootstrapToast.show();
      this.set("bootstrapToast", bootstrapToast);
    }
  }

  @computed()
  get toastId(): string {
    return `${guidFor(this)}-toast`;
  }

  get class(): string {
    const classes: string[] = [];
    classes.push('toast');

    if (this.toast.type === MessageType.SUCCESS) {
      classes.push('toast-success');
    }
    else if (this.toast.type === MessageType.ERROR) {
      classes.push('toast-error');
    }
    else if (this.toast.type === MessageType.INFO) {
      classes.push('toast-info');
    }
    else if (this.toast.type === MessageType.WARNING) {
      classes.push('toast-warning');
    }

    return classes.join(' ');
  }

  get ariaLive(): string {
    if (this.toast.type === MessageType.ERROR) {
      return 'assertive';
    } else {
      return 'polite';
    }
  }

  willDestroyElement() {
    this.bootstrapToast.hide();
    this.set('bootstrapToast', null);
    // @ts-ignore
    super.willDestroyElement(...arguments);

  }

  @action
  close() {
    this.toastService.removeToast(this.toast);
  }
}