import { getOwnConfig } from '@embroider/macros';
import Ember from 'ember';

export const VERSION = getOwnConfig().version;
export const NAME = getOwnConfig().name;

export function registerLibrary() {
  Ember.libraries.register(NAME, VERSION);
}
