import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),
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

    let id = model.belongsTo(field).id(); // todo returns blank after clearing field and rolling back attributes (when it should be the initial value)

    if(!Ember.isBlank(id)){
      const relationshipType = ModelUtils.getParentModelTypeName(model, field);
      if(this.get('store').hasRecordForId(relationshipType, id)){
        this.set('lookupValue', this.get('store').peekRecord(relationshipType, id));
      } else {
        yield model.get(field).then((value) => {
          this.set('lookupValue', value);
        });
      }
    }
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
