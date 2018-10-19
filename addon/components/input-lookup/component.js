import Component from '@ember/component';
import InputComponent from 'ember-field-components/mixins/component-input';
import QueryCondition from 'ember-mist-components/classes/query-condition';
import { getModelType, getPlural } from 'ember-field-components/classes/model-utils';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { isArray } from '@ember/array';

export default Component.extend(InputComponent, {
  type: 'lookup',
  noresults: 'No Results',
  store: service(),
  lookupFilters: computed('filters', function(){
    const filters = this.get('filters');
    const lookupFilters = [];
    filters.forEach((filter) => {
      if(!isBlank(filter.value) || !isBlank(filter.field)){
        const lookupFilter = QueryCondition.create();
        lookupFilter.set('field', dasherize(filter.field));
        lookupFilter.set('operator', filter.operator ? filter.operator : '=');
        lookupFilter.set('value', filter.value);

        lookupFilters.push(lookupFilter);
      }
    });

    return lookupFilters;
  }),
  activeModelType: computed('value', 'modelType', function(){
    // needed for polymorphic relationships
    if(isArray(this.get('modelType'))){
      const value = this.get('value');
      if(!isBlank(value)){
        return value.constructor.modelName;
      } else {
        return this.get('modelType')[0];
      }
    } else {
      return this.get('modelType');
    }
  }),
  modelTitle: computed('activeModelType', function(){
    const activeModelTypeName = this.get('activeModelType');
    if(!isBlank(activeModelTypeName)) {
      const modelType = getModelType(activeModelTypeName, this.get('store'));
      return getPlural(modelType);
    } else {
      return 'Models';
    }
  }),
  computedValue: computed('value', function(){
    if(isBlank(this.get('value'))){
      return null;
    } else {
      return this.get('value.name');
    }
  }),
  typeaheadParams: computed('lookupFilters', function(){
    const returnValue = {};
    const lookupFilters = this.get('lookupFilters');

    returnValue.filter = {};
    returnValue.filter['1'] = {
      field: 'name',
      operator: 'STARTS_WITH'
    }

    lookupFilters.forEach((lookupFilter, index) => {
      returnValue.filter[index+2] = lookupFilter.get('object')
    });

    return returnValue;
  }),
  actions: {
    showModal() {
      this.$('.modal').modal('show');
      this.set('modalVisible', true);
    },
    closeModal(){
      this.$('.modal').modal('hide');
      this.set('modalVisible', false);
    },
    clearLookup() {
      this.set('value', null);
      this.notifyAction(null);
    },
    rowSelected(row){
      this.send('closeModal');
      this.notifyAction(row.get('content'));
    },
    typeaheadSelected(model){
      this.notifyAction(model);
    }
  }
});
