import Route from "@ember/routing/route";
import Controller from "@ember/controller";

export default class ResetModelRoute extends Route {
  resetController(controller: Controller, isExiting: boolean, transition: any) {
    super.resetController(controller, isExiting, transition);
    controller.model.rollback();
  }

  activate() {
    super.activate();
    window.scrollTo(0, 0);
  }
}
