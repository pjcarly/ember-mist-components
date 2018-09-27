import component from 'ember-field-components/components/input-field-select/component';
import DynamicSelectOptionsMixin from 'ember-mist-components/mixins/component-select-field-dynamic-selectoptions';
import { hasWidget } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';

export default component.extend(DynamicSelectOptionsMixin, {
  isCountrySelect: computed(function() {
    const fieldAttributeOptions = this.get('fieldAttributeOptions');
    return hasWidget(fieldAttributeOptions, 'country-select');
  })
});
