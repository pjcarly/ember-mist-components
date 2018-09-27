import InputFieldFile from '../input-field-file/component';
import { isBlank } from '@ember/utils';
import { computed } from '@ember/object';

export default InputFieldFile.extend({
  tagName: 'div',
  type: 'image',
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
    showModal() {
      this.$('.modal').modal('show');
      this.set('modalVisible', true);
    },
    closeModal(){
      this.$('.modal').modal('hide');
      this.set('modalVisible', false);
    }
  }
});
