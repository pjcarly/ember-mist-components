import { assert } from "@ember/debug";
import { computed } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import TabsService from "@getflights/ember-mist-components/services/tabs";

export interface Arguments {
  default: string;
  id: string;
}

export default class TabsComponent extends Component<Arguments> {
  @service tabs!: TabsService;

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    assert(`Default is required on Tabs`, args.default);
    assert(`Id is required on Tabs`, args.id);

    if (!this.tabs.getSelectedTabFor(args.id)) {
      this.tabs.setSelectedTabFor(args.id, args.default);
    }
  }

  @computed()
  get bodyId(): string {
    return `${guidFor(this)}-body`;
  }

  get activeTab(): string {
    return this.tabs.getSelectedTabFor(this.args.id) ?? this.args.default;
  }

  setAactiveTab(activeTab: string) : void {
    return this.tabs.setSelectedTabFor(this.args.id, activeTab);
  }
}
