import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';

const { Component } = Ember;
const { computed } = Ember;
const { guidFor } = Ember;

export default Component.extend(FieldOutputComponent, {
  carouselName: computed(function(){
    return guidFor(this) + '-carousel';
  }),
  actions: {
    imageClicked(image){
      if(this.get('imageClicked')){
        this.get('imageClicked')(image);
      }
    }
  }
});
