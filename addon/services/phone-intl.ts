import { getOwner } from "@ember/application";
import { assert } from "@ember/debug";
import { computed } from "@ember/object";
import Service from "@ember/service";
import { task } from "ember-concurrency-decorators";

export default class PhoneIntlService extends Service {
  private utilsLoaded = false;

  @computed()
  get config(): any {
    return getOwner(this).resolveRegistration("config:environment");
  }

  @task
  async loadUtils(): Promise<void> {
    const src = this.config?.["ember-mist-components"]?.phoneIntlUtilsSource;
    assert("ember-mist-components.phoneIntlUtilsSource is not defined", src);

    if (!this.utilsLoaded) {
      await window.intlTelInputGlobals.loadUtils(src);
    }
  }
}
