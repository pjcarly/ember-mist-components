import Ember from 'ember';
import MenuItem from '../mist-menu-item/component';

export default MenuItem.extend({
  classNames: ['dropdown'],
  ariaId: Ember.computed(function(){
    const componentGuid = Ember.guidFor(this);
    return `${componentGuid}-trigger`;
  })
});
