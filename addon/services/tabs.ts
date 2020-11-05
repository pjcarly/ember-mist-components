import Service from "@ember/service";
// @ts-ignore
import { TrackedMap } from "tracked-maps-and-sets";

/**
 * This service is used as a way to track the selected state of tabs throughout your application
 * It just holds a map with as key the id of the Tabs component, and as value the selected tab
 */
export default class TabsService extends Service {
  state = new TrackedMap<string, string>();

  getSelectedTabFor(tabsId: string): string | undefined {
    if (this.state.has(tabsId)) {
      return this.state.get(tabsId);
    }

    return undefined;
  }

  setSelectedTabFor(tabsId: string, selectedTab: string): void {
    this.state.set(tabsId, selectedTab);
  }
}
