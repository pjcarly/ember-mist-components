import component from 'ember-field-components/components/output-field-select/component';
import DynamicSelectOptionsMixin from 'ember-mist-components/mixins/component-select-field-dynamic-selectoptions';
import { hasWidget } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';

export default component.extend(DynamicSelectOptionsMixin, {
  didReceiveAttrs(){
    this._super(...arguments);
    if(!this.get('isCountrySelect')){
      this.get('setSelectOptions').perform();
    }
  },
  isCountrySelect: computed(function() {
    const fieldAttributeOptions = this.get('fieldAttributeOptions');
    return hasWidget(fieldAttributeOptions, 'country-select');
  })
});
