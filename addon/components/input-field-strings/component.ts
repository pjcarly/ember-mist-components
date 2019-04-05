import { computed, action } from '@ember-decorators/object';
import { A } from '@ember/array';
import InputFieldComponent from 'ember-field-components/components/input-field/component';
import MutableArray from '@ember/array/mutable';

// TODO: fix bug, when pushing new object on the array, for some reason the object in the template isnt pushed to the end of the array, but instead to the end-1 position
export default class InputFieldStringsComponent extends InputFieldComponent {
  @computed('value.@each')
  get items() : MutableArray<string> {
    return this.value ? this.value : A();
  }

  @action
  reorderLines(reorderedLines: MutableArray<string>) {
    this.set('value', reorderedLines);
  }

  @action
  setArrayValue(index: number, newValue: string) {
    const items = this.items;
    items.insertAt(index, newValue);

    this.set('value', items);
  }

  @action
  removeIndexFromValue(indexToRemove: number) {
    const items = this.items;
    items.removeAt(indexToRemove);
    this.set('value', items);
  }

  @action
  addNewValue() {
    const items = this.items;
    items.pushObject('');
    this.set('value', items);
  }
}
