import Ember from 'ember';
import MenuItem from '../mist-menu-item/component';

const { computed } = Ember;
const { guidFor } = Ember;

export default MenuItem.extend({
  classNames: ['dropdown'],
  ariaId: computed(function(){
    const componentGuid = guidFor(this);
    return `${componentGuid}-trigger`;
  })
});
