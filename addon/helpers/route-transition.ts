import Helper from '@ember/component/helper';
import { inject as service } from '@ember-decorators/service';

interface RouterService {
  transitionTo(route: string, id?: string) : void;
}

export default class ArrayJoinHelper extends Helper {
  @service router!: RouterService;

  compute([route] : [string]) {
    return () => {
      this.router.transitionTo(route);
    }
  }
}
