import { A } from "@ember/array";
import MutableArray from "@ember/array/mutable";
import { computed, action } from "@ember/object";
import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
// TODO: fix bug, when pushing new object on the array, for some reason the object in the template isnt pushed to the end of the array, but instead to the end-1 position
/**
 * Workaround for https://github.com/adopted-ember-addons/ember-sortable/issues/234:
 * Add this to your app CSS
 *
 * .sortable-item {
 *  transition: all 0.125s;
 *
 *  &.is-dragging {
 *   transition-duration: 0s;
 * }
}
 */
export default class InputMultiFieldComponent extends InputFieldComponent {
  value?: any[];

  @computed("value.@each")
  get items(): MutableArray<any> {
    return A(this.value);
  }

  syncValue() {
    this.set("value", this.items.toArray());
  }

  @action
  itemValueChanged(index: number, value: any) {
    this.setArrayValue(index, value);
  }

  @action
  reorderLines(reorderedLines: string[]) {
    this.set("value", reorderedLines);
  }

  @action
  setArrayValue(index: number, newValue: string) {
    this.items.replace(index, 1, A([newValue]));
    this.syncValue();
  }

  @action
  removeIndexFromValue(indexToRemove: number) {
    this.items.removeAt(indexToRemove);
    this.syncValue();
  }

  @action
  addNewValue() {
    this.items.pushObject("");
    this.syncValue();
  }
}
