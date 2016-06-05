import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['banner-image'],
  value: Ember.computed('model', 'field', function(){
    let value = this.get('model').get(this.get('field'));
    if(!Ember.isBlank(value)){
      return value;
    }
  })
});
