import ListViewSelectComponent from "../list-view-select/component";
import { computed } from "@ember-decorators/object";
import { getOwner } from "@ember/application";

export default class ListViewTabsComponent extends ListViewSelectComponent {
  /**
   * Returns the config for this application
   */
  @computed
  get config() : any {
    return getOwner(this).resolveRegistration('config:environment');
  }

  /**
   * Returns the bootstrap version defined in the config, depending on this value the colums will be rendered differently
   */
  @computed('config')
  get bootstrapVersion() : number | undefined {
    const config = this.config;
    if(config.hasOwnProperty('ember-mist-components') && config['ember-mist-components'].hasOwnProperty('bootstrapVersion')) {
      return config['ember-mist-components'].bootstrapVersion;
    }

    return;
  }
}
