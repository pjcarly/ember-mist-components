import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";
import Image from "@getflights/ember-mist-components/interfaces/image";
import { field } from "@getflights/ember-mist-components/decorators/attribute";
import { assert } from "@ember/debug";
import UserModelInterface from "@getflights/ember-mist-components/interfaces/user";

export default class UserModel extends DrupalModel implements UserModelInterface {
  @field("string")
  name!: string;

  @field("boolean", { widget: "switch" })
  status!: boolean;

  @field("string", { validation: { required: true } })
  firstName!: string;

  @field("string", { validation: { required: true } })
  lastName!: string;

  @field("email", { validation: { required: true } })
  mail!: string;

  @field("image")
  userPicture?: Image;

  @field("number", { precision: 10, decimals: 0 })
  unseenNotifications!: number;

  @field("datetime")
  notificationsViewed?: Date;

  @field('multi-select')
  permissions?: string[];

  setNotificationsViewed() {
    assert("Not yet implemented");
  }

  setAllNotificationsRead() {
    assert("Not yet implemented");
  }

  hasPermission(permission: string) {
    return this.permissions?.includes(permission) ?? false;
  }

  /* Relationships */

  static settings = {
    listViews: {
      default: {
        columns: ["name", "first-name", "last-name", "mail", "phone"],
      },
    },
  };
}
