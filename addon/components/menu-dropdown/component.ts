import Component from "@glimmer/component";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { cached } from "@glimmer/tracking";
// @ts-ignore
import Dropdown from "bootstrap.native/dist/components/dropdown-native";

export interface Arguments {
  iconComponent?: Component;
}

export default class MenuDropdownComponent extends Component<Arguments> {
  bootstrapDropdown?: Dropdown;

  @cached
  get dropdownElementId(): string {
    return `${guidFor(this)}-dropdown`;
  }

  @cached
  get ariaId(): string {
    return `${guidFor(this)}-trigger`;
  }

  @action
  elementInsertedInDOM(element: HTMLElement) {
    const bootstrapDropdown = new Dropdown(element);
    this.bootstrapDropdown = bootstrapDropdown;
  }

  @action
  elementWillBeRemovedFromDOM() {
    this.bootstrapDropdown = undefined;
  }

  @action
  clickOutside() {
    this.bootstrapDropdown?.hide();
  }

  @action
  toggle() {
    this.bootstrapDropdown?.toggle();
  }
}
