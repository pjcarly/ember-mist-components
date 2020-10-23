import { A } from "@ember/array";
import NativeArray from "@ember/array/-private/native-array";
import MutableArray from "@ember/array/mutable";
import { action } from "@ember/object";
import InputFieldComponent, {
  InputFieldArguments,
} from "@getflights/ember-field-components/components/input-field/component";
import { tracked } from "@glimmer/tracking";
// TODO: fix bug, when pushing new object on the array, for some reason the object in the template isnt pushed to the end of the array, but instead to the end-1 position
/**
 * Workaround for https://github.com/adopted-ember-addons/ember-sortable/issues/234
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

export class MultiFieldItem<T> {
  @tracked value: T | null;

  constructor(value: T | null) {
    this.value = value;
  }
}

export default abstract class InputMultiFieldComponent<
  T1 extends InputFieldArguments<(T2 | null)[]>,
  T2
> extends InputFieldComponent<T1, (T2 | null)[]> {
  private _items!: NativeArray<MultiFieldItem<T2>>;

  get items(): MutableArray<MultiFieldItem<T2>> {
    const items = A<MultiFieldItem<T2>>();
    const values = this.value;

    if (Array.isArray(values)) {
      values.forEach((value) => {
        const item = new MultiFieldItem<T2>(value ?? null);
        items.pushObject(item);
      });
    }

    this._items = items;
    return items;
  }

  syncValue() {
    const value: (T2 | null)[] = [];

    this._items.forEach((item) => {
      value.push(item.value ?? null);
    });

    this.setNewValue(value);
  }

  @action
  addNewItem() {
    this._items.pushObject(new MultiFieldItem<T2>(null));
    this.syncValue();
  }

  @action
  removeItem(index: number) {
    this._items.removeAt(index);
    this.syncValue();
  }

  @action
  itemChanged(index: number, newValue: T2 | null) {
    const value = this.value;

    if (value) {
      value[index] = newValue;
    }

    const item = this._items.objectAt(index);
    if (item) {
      item.value = newValue;
    }
  }

  @action
  reorderItems(reorderedItems: MultiFieldItem<T2 | null>[]) {
    const newValue: (T2 | null)[] = [];

    reorderedItems.forEach((item) => {
      newValue.push(item.value);
    });

    this.setNewValue(newValue);
  }
}
