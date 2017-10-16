import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import ImageUtilities from 'ember-mist-components/classes/image';

const { Component, computed, isBlank } = Ember;

export default Component.extend(FieldOutputComponent, {
  imageUrl: computed('style', 'value', 'value.url', function(){
    return ImageUtilities.getSecureUrl(this.get('model'), this.get('field'), this.get('style'));
  }),
  actions: {
    clickImage(){
      if(this.get('clickImage')){
        this.get('clickImage')();
      }
    }
  }
});
