import Service from "@ember/service";
import { inject as service } from "@ember/service";
import swal from "sweetalert2";

export default class DialogService extends Service {
  @service intl!: any;

  async confirm(title?: string): Promise<boolean> {
    return swal
      .fire({
        title: title ?? this.intl.t("label.are_you_sure"),
        icon: "warning",
        confirmButtonText: this.intl.t("label.yes"),
        showCancelButton: true,
        cancelButtonText: this.intl.t("label.cancel"),
        cancelButtonColor: "#ffffff",
        reverseButtons: true,
        buttonsStyling: false,
      })
      .then((result) => {
        return result.isConfirmed;
      });
  }
}
