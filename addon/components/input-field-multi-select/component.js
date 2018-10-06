import component from 'ember-field-components/components/input-field-multi-select/component';
import DynamicSelectOptionsMixin from 'ember-mist-components/mixins/component-select-field-dynamic-selectoptions';

export default component.extend(DynamicSelectOptionsMixin, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('setSelectOptions').perform();
  }
});
