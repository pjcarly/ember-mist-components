import Component from "@ember/component";
import { tagName } from "@ember-decorators/component";
import { inject as service } from "@ember/service";
import ToastService from "@getflights/ember-mist-components/services/toast";

@tagName("")
export default class ToastContainer extends Component {
  @service toast!: ToastService;
}
