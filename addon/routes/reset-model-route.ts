import Route from '@ember/routing/route';
import Controller from "@ember/controller";

export default class ResetModelRoute extends Route {
  resetController(controller: Controller) {
    this._super(...arguments);
    controller.model.rollback();
  }

  activate() {
    super.activate();
    window.scrollTo(0,0);
  }
}
