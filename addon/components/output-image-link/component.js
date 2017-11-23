import Ember from 'ember';
import OutputComponent from 'ember-field-components/mixins/component-output';

const { Component } = Ember;

export default Component.extend(OutputComponent, {
  type: 'image-link'
});
