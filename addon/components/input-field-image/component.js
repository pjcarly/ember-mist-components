import InputFieldFile from '../input-field-file/component';

export default InputFieldFile.extend({
  tagName: 'div',
  type: 'image',
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
