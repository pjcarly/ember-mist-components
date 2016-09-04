import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(FieldOutputComponent, {
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  setInitialValue: task(function * (){
    let field = this.get('field');
    let model = this.get('model');

    yield model.get(field).then((value) => {
      this.set('lookupValue', value);
    });
  }),
  route: Ember.computed('lookupValue', function(){
    const lookupValue = this.get('lookupValue');
    if(!Ember.isBlank(lookupValue)){
      return `${ModelUtils.getModelName(lookupValue)}.view`;
    }
  })
});
