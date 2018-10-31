/* jshint noyield:true */
import OutputFieldBelongsToComponent from '../output-field-belongsto/component';
import Model from 'ember-data/model';
import DynamicObserverComponent from 'ember-field-components/mixins/component-dynamic-observer';

import { none } from '@ember/object/computed';
import { hasWidget } from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { assert } from '@ember/debug';

export default OutputFieldBelongsToComponent.extend(DynamicObserverComponent, {
  tagName: '',
  store: service(),
  init(){
    this._super(...arguments);
    this.get('setSelectOptions').perform();
  },
  isRequired: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');
    return options.hasOwnProperty('validation') && options.validation.hasOwnProperty('required') && options.validation.required;
  }),
  isSelect: computed(function(){
    return hasWidget(this.get('relationshipAttributeOptions'), 'select');
  }),
  filters: computed('relationshipAttributeOptions', function(){
    const options = this.get('relationshipAttributeOptions');

    if(!isBlank(options) && options.hasOwnProperty('filters')){
      return options.filters;
    }

    return [];
  }),
  dynamicComponentName: computed('relationshipModelType', function(){
    const relationshipModelType = this.get('relationshipModelType');
    return `input-belongsto-${relationshipModelType}`;
  }),
  selectOptionsNotLoaded: none('selectOptions'),
  setSelectOptions: task(function *(){
    if(this.get('isSelect')){
      assert('Select widget is not supported for polymorphic relationships', !this.get('isPolymorphic'));

      const relationshipTypeName = this.get('relationshipModelType');
      // loadAll is provided by the ember-data-storefront addon, and does magic to not load data twice
      // This is really helpful in case there are multiple components referencing to the same type in the template
      // The query will only be done once
      const models = yield this.get('store').loadAll(relationshipTypeName);

      let selectOptions = [];
      models.forEach((model) => {
        let selectOption = {};
        selectOption.value = model.get('id');
        selectOption.label = model.get('name');
        selectOptions.push(selectOption);
      });

      this.set('selectOptions', selectOptions);
    }
  }).drop(),
  noChoiceAvailable: computed('selectOptions', 'value', function(){
    const selectOptions = this.get('selectOptions');
    return (selectOptions.get('length') === 1) && selectOptions[0].value === this.get('fieldId');
  }),
  actions: {
    valueChanged(value){
      const { field, model } = this.getProperties('field', 'model');

      if(!isBlank(value)) {
        if(!(value instanceof Model)) {
          // In case a Select widget was used, the returned value is not the Model itself, but the ID of the model,
          // We must find that model in the store by the ID (which should be loaded in the store already because of the setSelectOptions function)

          // This isnt possible with polymorphic relationships
          assert('Select widget is not supported for polymorphic relationships', !this.get('isPolymorphic'));

          const relationshipTypeName = this.get('relationshipModelType');
          let foundModel = this.get('store').peekRecord(relationshipTypeName, value);
          assert(`Model with id: ${value} and type: ${relationshipTypeName} not found in store`, !isBlank(foundModel));

          value = foundModel;
        }
      }

      model.set(field, value);

      if(this.get('valueChanged')){
        this.get('valueChanged')(...arguments);
      }

      // And finally clear potential Errors
      let errors = model.get('errors');
      errors.remove(field);
    }
  }
});
