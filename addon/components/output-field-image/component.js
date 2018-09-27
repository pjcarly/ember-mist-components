import Component from '@ember/component';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';

export default Component.extend(FieldOutputComponent, {
  actions: {
    imageClicked(){
      if(this.get('imageClicked')){
        this.get('imageClicked')();
      }
    }
  }
});
