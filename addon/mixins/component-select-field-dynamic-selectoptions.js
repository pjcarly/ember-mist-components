import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import FieldUtils from 'ember-mist-components/classes/field-utils';

const { Mixin, inject, isBlank, String } = Ember;
const { dasherize, camelize } = String;
const { service } = inject;

export default Mixin.create({
  store: service(),

  init(){
    this._super(...arguments);
    this.get('setSelectOptions').perform();
  },
  setSelectOptions: task(function * (){
    const selectOptionsOnAttribute = this.get('selectOptions');
    if(!isBlank(selectOptionsOnAttribute)){
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
      if(!isBlank(localSelectOptions)) {
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

      if(!isBlank(cachedSelectOptions)){
        this.set('cachedSelectOptions', cachedSelectOptions);

        if(isBlank(localSelectOptions)){
          this.get('storage').set(localKey, cachedSelectOptions);
        }
      }
    }

    // We must use a custom property and check for it in the template
    // instead of checking setSelectOptions.last, because a mixin is used
    // If multiple select fields are on the same page, and the task runs for the first field
    // then the variable .last on the task will be shared with every instance where the mixin is included
    this.set('setSelectOptionsRanOnce', true);
  })
});
