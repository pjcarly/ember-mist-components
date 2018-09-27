import Component from '@ember/component';

export default Component.extend({
  tagName: 'aside',
  toggled: false,
  classNameBindings: ['toggled:toggled'],
});
