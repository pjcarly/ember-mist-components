import Ember from 'ember';
import MenuItem from '../mist-menu-item/component';

export default MenuItem.extend({
  classNames: ['dropdown'],
  classNameBindings: ['open'],
  open: false,
  actions: {
    toggle() {
      this.set('open', !this.get('open'));
    }
  }
});
