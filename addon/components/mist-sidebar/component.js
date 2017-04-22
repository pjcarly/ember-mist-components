import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  tagName: 'aside',
  toggled: false,
  classNameBindings: ['toggled:toggled'],
});
