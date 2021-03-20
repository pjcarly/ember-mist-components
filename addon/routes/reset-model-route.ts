import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';

export default class ResetModelRoute extends Route {
  // @ts-ignore
  resetController(
    controller: Controller,
    isExiting: boolean,
    transition: Transition
  ) {
    // @ts-ignore
    super.resetController(controller, isExiting, transition);
    controller.model.rollback();
  }

  activate() {
    super.activate();
    window.scrollTo(0, 0);
  }
}
