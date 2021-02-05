import { action, computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import Component from "@glimmer/component";

export interface Arguments {}

export default class AccordionComponent extends Component<Arguments> {
  element!: HTMLElement;

  @computed()
  get id(): string {
    return `${guidFor(this)}-accordion`;
  }

  @action
  elementInsertedInDOM(element: HTMLElement) {
    this.element = element;
  }
}
