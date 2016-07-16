import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['banner-image'],
  value: Ember.computed('model', 'field', function(){
    let model = this.get('model');
    let field = this.get('field');

    if(!Ember.isBlank(model) && !Ember.isBlank(field)){
      let value = this.get('model').get(this.get('field'));
      if(!Ember.isBlank(value)){
        return value;
      }
    }
  })
});
