import NativeArray from "@ember/array/-private/native-array";
import BaseInput, {
  Arguments,
} from "@getflights/ember-field-components/components/BaseInput";
import { MultiFieldItem } from "../input-multi-field/component";
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

export interface MultiArguments extends Arguments {
  inputComponent: string;
  items: NativeArray<MultiFieldItem<any>>;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  itemChanged: (index: number, newValue: any) => void;
  reorderItems: (reorederedItems: NativeArray<MultiFieldItem<any>>) => void;
}

export default class InputMultiComponent extends BaseInput<MultiArguments> {
  type = "multi";
}
