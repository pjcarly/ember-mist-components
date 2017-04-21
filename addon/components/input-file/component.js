import Ember from 'ember';
const { Component, isEmpty } = Ember;

export default Component.extend({
  actions: {
    filesSelected(event){
      const input = event.target;
      if (!isEmpty(input.files)) {
        this.sendAction('valueChanged', input.files);
      }
    }
  }
});