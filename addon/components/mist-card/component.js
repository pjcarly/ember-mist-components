import Ember from 'ember';
import ModelTasksMixin from 'ember-mist-components/mixins/model-tasks';

const { Component } = Ember;

export default Component.extend(ModelTasksMixin, {
  classNames: ['card']
});
