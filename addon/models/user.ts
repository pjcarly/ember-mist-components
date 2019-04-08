import DrupalModel from 'ember-mist-components/models/drupal-model';
import Image from 'ember-mist-components/interfaces/image';
import { field } from 'ember-field-components/model/attribute';
import { assert } from '@ember/debug';

export default class UserModel extends DrupalModel {
  @field('string')
  name !: string;

  @field('boolean', { widget: 'switch' })
  status !: boolean;

  @field('string', { validation: { required: true }})
  firstName !: string;

  @field('string', { validation: { required: true }})
  lastName !: string;

  @field('email', { validation: { required: true }})
  mail !: string;

  @field('image')
  userPicture ?: Image;

  @field('number', { precision: 10, decimals: 0 })
  unreadNotifications !: number;


  setNotificationsViewed() {
    assert('Not yet implemented');
  }

  setAllNotificationsRead() {
    assert('Not yet implemented');
  }

  /* Relationships */

  static settings = {
    listViews: {
      default: {
        columns: ['name', 'first-name', 'last-name', 'mail', 'phone']
      }
    }
  }
}
