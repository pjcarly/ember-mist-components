import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';

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
