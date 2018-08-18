import Ember from 'ember';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';

const { Component } = Ember;
const { isBlank } = Ember;

export default Component.extend(FieldInputComponent, {
  actions: {
    reorderLines(reorderedLines){
      this.set('value', reorderedLines);
    },
    setArrayValue(index, newValue){
      const array = this.get('value');
      array[index] = newValue;
    },
    removeIndexFromValue(indexToRemove){
      const array = this.get('value');
      const newArray = [];

      array.forEach((singleValue, index) => {
        if(index !== indexToRemove){
          newArray.push(singleValue);
        }
      });

      this.set('value', newArray);
    },
    addNewValue(){
      const value = isBlank(this.get('value')) ? [] : this.get('value');
      const newValue = [];

      value.forEach((singleValue) => {
        newValue.push(singleValue);
      });

      newValue.push('');

      this.set('value', newValue);
    }
  }
});
