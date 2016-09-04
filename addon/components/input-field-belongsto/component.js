import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

export default Ember.Component.extend({
  tagName: '',
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  relationshipModelType: Ember.computed('model', 'field', function(){
    return ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));
  }),
  setInitialValue: task(function * (){
    let field = this.get('field');
    let model = this.get('model');

    yield model.get(field).then((value) => {
      this.set('lookupValue', value);
    });
  }),
  actions: {
    valueChanged: function(value){
      let field = this.get('field');
      let model = this.get('model');

      model.set(field, value);
      this.set('lookupValue', value);
    }
  }
});
