import Component from "@glimmer/component";
import { action, computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import Dropdown from "bootstrap.native/dist/components/dropdown-native.esm.js";

export interface Arguments {
  iconComponent?: Component;
}

export default class MenuDropdownComponent extends Component<Arguments> {
  bootstrapDropdown?: Dropdown;

  @computed()
  get dropdownElementId(): string {
    return `${guidFor(this)}-dropdown`;
  }

  @computed()
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
}
