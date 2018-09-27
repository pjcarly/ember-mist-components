import Component from '@ember/component';

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
