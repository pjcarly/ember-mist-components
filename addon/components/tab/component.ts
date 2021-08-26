import { assert } from "@ember/debug";
import { action } from "@ember/object";
import Component from "@glimmer/component";
import TabsComponent from "../tabs/component";

export interface Arguments {
  tabs: TabsComponent;
  id: string;
  disabled ?: boolean;
}

export default class TabComponent extends Component<Arguments> {
  constructor(owner: any, args: Arguments) {
    super(owner, args);

    assert(`id on Tab is required`, args.id);
    assert(`tabs on Tab is required`, args.tabs);
  }

  get isActive(): boolean {
    return this.args.tabs.activeTab === this.args.id;
  }

  @action
  setActive() {
    this.args.tabs.setActiveTab(this.args.id);
  }
}
