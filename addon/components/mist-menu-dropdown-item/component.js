import MenuItem from '../mist-menu-item/component';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default MenuItem.extend({
  classNames: ['dropdown'],
  ariaId: computed(function(){
    const componentGuid = guidFor(this);
    return `${componentGuid}-trigger`;
  })
});
