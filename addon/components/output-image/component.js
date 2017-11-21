import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  tagName: '',
  type: 'image',
  actions: {
    imageClicked(){
      if(this.get('imageClicked')){
        this.get('imageClicked')();
      }
    }
  }
});
