import Ember from 'ember';
import InputFieldFile from '../input-field-file/component';

const { isBlank } = Ember;
const { computed } = Ember;
const { guidFor } = Ember;

export default InputFieldFile.extend({
  tagName: 'div',
  type: 'images',
  carouselName: computed(function(){
    return guidFor(this) + '-carousel';
  }),
  modifiedOptions: computed('options', function(){
    let options = this.get('options');

    if(isBlank(options)) {
      options = {};
    }

    if(!options.endpoint) {
      options.endpoint = 'image/images';
    }

    return options;
  }),
  actions: {
    valueChanged(changedIndex, changedValue){
      let values = this.get('value');
      let newValues = [];

      values.forEach((value, index) => {
        if(index === changedIndex) {
          if(isBlank(changedValue)) {
            // Can only be used if value must be deleted, if a value is added, it is an array, and added to the end
            value = changedValue;
          }
        }

        if(!isBlank(value) && value.hasOwnProperty('id') && value.id > 0) {
          newValues.push(value);
        }
      });

      if(isBlank(changedIndex) && !isBlank(changedValue) && changedValue.constructor === Array) {
        changedValue.forEach((newValue) => {
          if(!isBlank(newValue) && newValue.hasOwnProperty('id') && newValue.id > 0) {
            newValues.push(newValue);
          }
        })
      }

      this.set('value', newValues);
    }
  }
});
