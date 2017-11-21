import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';

const { Component } = Ember;

export default Component.extend(FieldOutputComponent, {
  actions: {
    imageClicked(){
      if(this.get('imageClicked')){
        this.get('imageClicked')();
      }
    }
  }
});
