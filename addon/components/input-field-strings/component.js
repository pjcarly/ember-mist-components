import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { A } from '@ember/array';

// TODO: fix bug, when pushing new object on the array, for some reason the object in the template isnt pushed to the end of the array, but instead to the end-1 position
export default Component.extend(FieldInputComponent, {
  items: computed('value.@each', function(){
    return isBlank(this.get('value')) ? A() : this.get('value');
  }),
  actions: {
    reorderLines(reorderedLines){
      this.set('value', reorderedLines);
    },
    setArrayValue(index, newValue){
      const items = this.get('items');
      items[index] = newValue;
      this.set('value', items);
    },
    removeIndexFromValue(indexToRemove){
      const items = this.get('items');
      items.removeAt(indexToRemove);
      this.set('value', items);
    },
    addNewValue(){
      const items = this.get('items');
      items.pushObject('');
      this.set('value', items);
    }
  }
});