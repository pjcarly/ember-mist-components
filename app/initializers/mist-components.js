import { registerLibrary } from '@getflights/ember-mist-components/version';

export function initialize(/* container, application */) {
  registerLibrary();
}

export default {
  name: 'mist-components',
  initialize,
};
