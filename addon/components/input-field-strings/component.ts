import { computed, action } from "@ember/object";
import InputFieldComponent from "ember-field-components/components/input-field/component";

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
export default class InputFieldStringsComponent extends InputFieldComponent {
  @computed("value.@each")
  get items(): string[] {
    return this.value ? this.value : [];
  }

  @action
  reorderLines(reorderedLines: string[]) {
    console.log(reorderedLines);
    this.set("value", reorderedLines);
  }

  @action
  setArrayValue(index: number, newValue: string) {
    const items = this.items;
    items[index] = newValue;

    this.set("value", items);
  }

  @action
  removeIndexFromValue(indexToRemove: number) {
    const items = this.items;
    items.splice(indexToRemove, 1);

    this.set("value", items);
  }

  @action
  addNewValue() {
    const items = this.items;
    items.push("");

    this.set("value", items);
  }
}
