import { assert } from "@ember/debug";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import Component from "@glimmer/component";
import { cached, tracked } from "@glimmer/tracking";
import Collapse from "bootstrap.native/dist/components/collapse-native.esm.js";

export interface Arguments {
  accordion: AccordionComponent;
}

export default class AccordionComponent extends Component<Arguments> {
  bootstrapCollapse?: Collapse;
  @tracked visible = false;

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    assert(`Accordion is required on Accorion Item`, args.accordion);
  }

  @cached
  get bodyId(): string {
    return `${guidFor(this)}-body`;
  }

  @cached
  get headingId(): string {
    return `${guidFor(this)}-heading`;
  }

  @action
  elementInsertedInDOM(element: HTMLElement) {
    const bootstrapDropdown = new Collapse(element, {
      parent: this.args.accordion.element,
    });
    this.bootstrapCollapse = bootstrapDropdown;
    element.addEventListener("shown.bs.collapse", this.showAccordionListener);
    element.addEventListener("hidden.bs.collapse", this.hideAccordionListener);
  }

  @action
  showAccordionListener() {
    this.visible = true;
  }

  @action
  hideAccordionListener() {
    this.visible = true;
  }

  @action
  elementWillBeRemovedFromDOM() {
    this.bootstrapCollapse = undefined;
  }
}
