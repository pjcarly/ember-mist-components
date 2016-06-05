import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'aside',
  toggled: false,
  classNameBindings: ['toggled:toggled'],
});
