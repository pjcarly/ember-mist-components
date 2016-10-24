import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    filesSelected(event){
      const input = event.target;
      if (!Ember.isEmpty(input.files)) {
        this.sendAction('valueChanged', input.files);
      }
    }
  }
});
/*
import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
  filesDidChange: function(files) {
    this.sendAction('valueChanged', files);
  }
});
*/
