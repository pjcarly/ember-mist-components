import Mixin from '@ember/object/mixin';
import { getModelName } from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import { transformFieldSelectOptionsToSelectOptions } from 'ember-mist-components/classes/field-utils';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { dasherize } from '@ember/string';
import { camelize } from '@ember/string';

export default Mixin.create({
  store: service(),

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
      const modelName = getModelName(model);
      const id = `${modelName}.${dasherize(field)}`;

      // first we check if the local storage has the values cached
      const localKey = camelize(`selectoptions_${id}`);
      const localSelectOptions = this.get('storage').get(localKey);
      if(!isBlank(localSelectOptions)) {
        cachedSelectOptions = localSelectOptions;
      } else if(store.hasRecordForId('field', id)){
        // next we check if we haven't already loaded the selectOptions
        let fieldModel = store.peekRecord('field', id);
        cachedSelectOptions = transformFieldSelectOptionsToSelectOptions(fieldModel);
      } else {
        // not yet loaded, let's do a callout
        yield store.loadRecord('field', id).then((fieldModel) => {
          cachedSelectOptions = transformFieldSelectOptionsToSelectOptions(fieldModel);
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
