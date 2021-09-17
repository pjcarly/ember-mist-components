import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import Component from "@glimmer/component";
import { cached } from "@glimmer/tracking";

export interface Arguments { }

export default class AccordionComponent extends Component<Arguments> {
  element!: HTMLElement;

  @cached
  get id(): string {
    return `${guidFor(this)}-accordion`;
  }

  @action
  elementInsertedInDOM(element: HTMLElement) {
    this.element = element;
  }
}
