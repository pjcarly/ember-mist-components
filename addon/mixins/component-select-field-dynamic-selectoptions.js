import Mixin from '@ember/object/mixin';
import { getModelName } from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import { transformFieldSelectOptionsToSelectOptions } from 'ember-mist-components/classes/field-utils';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { dasherize } from '@ember/string';
import { camelize } from '@ember/string';
import { assert } from '@ember/debug';

export default Mixin.create({
  store: service(),

  setSelectOptions: task(function * (){
    if(!isBlank(this.get('selectOptions'))){
      // selectoptions defined on the model attribute, we can ignore the rest
      return;
    }

    let cachedSelectOptions;
    const store = this.get('store');
    const field = this.get('field');
    const model = this.get('model');
    const modelName = getModelName(model);
    const id = `${modelName}.${dasherize(field)}`;

    const fieldAdapter = store.adapterFor('field');
    assert(`Dynamic select options not enabled for model: ${modelName} and field: ${field}. Did you forget to create the Field model, or include selectOptions on your field?`, isBlank(fieldAdapter));

    // first we check if the local storage has the values cached
    const localKey = camelize(`selectoptions_${id}`);
    const localSelectOptions = this.get('storage').get(localKey);
    if(!isBlank(localSelectOptions)) {
      cachedSelectOptions = localSelectOptions;
    } else if(store.hasRecordForId('field', id)){
      // next we check if we haven't already loaded the selectOptions
      const fieldModel = store.peekRecord('field', id);
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

    // We must use a custom property and check for it in the template
    // instead of checking setSelectOptions.last, because a mixin is used
    // If multiple select fields are on the same page, and the task runs for the first field
    // then the variable .last on the task will be shared with every instance where the mixin is included
    this.set('setSelectOptionsRanOnce', true);
  })
});
