import component from 'ember-field-components/components/input-field-select/component';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import FieldUtils from 'ember-mist-components/classes/field-utils';

const { dasherize } = Ember.String;

export default component.extend({
  store: Ember.inject.service(),

  init(){
    this._super(...arguments);
    this.get('setSelectOptions').perform();
  },
  setSelectOptions: task(function * (){
    const selectOptionsOnAttribute = this.get('selectOptions');
    if(!Ember.isBlank(selectOptionsOnAttribute)){
      // selectoptions were defined on the model attribute, we use that above all
      this.set('cachedSelectOptions', selectOptionsOnAttribute);
    } else {
      // no selectoptions defined on the model attribute, we will have to look for them
      let store = this.get('store');
      const field = this.get('field');
      const model = this.get('model');
      const modelName = ModelUtils.getModelName(model);
      const id = `${modelName}.${dasherize(field)}`;

      // first we check if we haven't already loaded the selectOptions
      if(store.hasRecordForId('field', id)){
        let fieldModel = store.peekRecord('field', id);
        this.set('cachedSelectOptions', FieldUtils.transformFieldSelectOptionsToSelectOptions(fieldModel));
      } else {
        // not yet loaded, let's do a callout
        yield store.findRecord('field', id).then((fieldModel) => {
          this.set('cachedSelectOptions', FieldUtils.transformFieldSelectOptionsToSelectOptions(fieldModel));
        });
      }
    }

    this.set('ranOnceAtLeast', true);
  })
});
