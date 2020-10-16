import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import ToastService from "@getflights/ember-mist-components/services/toast";

export default class ToastContainer extends Component {
  @service toast!: ToastService;
}
