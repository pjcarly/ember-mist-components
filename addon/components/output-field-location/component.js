import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  value: Ember.computed('model', 'field', function(){
    return this.get('model').get(this.get('field'));
  })
});
