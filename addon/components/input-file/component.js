import Component from '@ember/component';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  tagName: '',
  actions: {
    filesSelected(event){
      const input = event.target;
      if (!isEmpty(input.files)) {
        const valueChanged = this.get('valueChanged');
        if(valueChanged){
          valueChanged(input.files);
        }
      }
    }
  }
});
