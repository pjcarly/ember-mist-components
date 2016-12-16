import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(FieldOutputComponent, {
  store: Ember.inject.service(),
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  setInitialValue: task(function * (){
    const field = this.get('field');
    const model = this.get('model');
    const id = model.belongsTo(field).id();

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
  route: Ember.computed('lookupValue', function(){
    const lookupValue = this.get('lookupValue');
    if(!Ember.isBlank(lookupValue)){
      return `${ModelUtils.getModelName(lookupValue)}.view`;
    }
  })
});
