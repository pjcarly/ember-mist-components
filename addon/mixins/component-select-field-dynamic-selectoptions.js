import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import FieldUtils from 'ember-mist-components/classes/field-utils';

const { dasherize, camelize } = Ember.String;

export default Ember.Mixin.create({
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
      let cachedSelectOptions;
      let store = this.get('store');
      const field = this.get('field');
      const model = this.get('model');
      const modelName = ModelUtils.getModelName(model);
      const id = `${modelName}.${dasherize(field)}`;

      // first we check if the local storage has the values cached
      const localKey = camelize(`selectoptions_${id}`);
      const localSelectOptions = this.get('storage').get(localKey);
      if(!Ember.isBlank(localSelectOptions)) {
        cachedSelectOptions = localSelectOptions;
      } else if(store.hasRecordForId('field', id)){
        // next we check if we haven't already loaded the selectOptions
        let fieldModel = store.peekRecord('field', id);
        cachedSelectOptions = FieldUtils.transformFieldSelectOptionsToSelectOptions(fieldModel);
      } else {
        // not yet loaded, let's do a callout
        yield store.findRecord('field', id).then((fieldModel) => {
          cachedSelectOptions = FieldUtils.transformFieldSelectOptionsToSelectOptions(fieldModel);
        });
      }

      if(!Ember.isBlank(cachedSelectOptions)){
        this.set('cachedSelectOptions', cachedSelectOptions);

        if(Ember.isBlank(localSelectOptions)){
          this.get('storage').set(localKey, cachedSelectOptions);
        }
      }
    }

    this.set('ranOnceAtLeast', true);
  })
});
