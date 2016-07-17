import Ember from 'ember';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(FieldInputComponent, {
  session: Ember.inject.service(),
  ajax: Ember.inject.service(),

  deleteFile: task(function * (){
    let value = this.get('value');

    if(!Ember.isBlank(value.id)){
      this.set('value', null);
    }
  }).drop(),
  uploadFile: task(function * (files){
    if (!Ember.isEmpty(files)) {
      let config = Ember.getOwner(this).resolveRegistration('config:environment');

      var uploader = EmberUploader.Uploader.extend({
        url: `${config.apiEndpoint}file/files`,
        type: 'POST',
        ajaxSettings: {
          headers: this.get('ajax.headers')
        }
      }).create();

      yield uploader.upload(files[0]).then((data) => {
        let fileObject = {};
        fileObject.id = data.data.id;
        fileObject.filename = data.data.attributes.filename;
        fileObject.uri = data.data.attributes.uri;
        fileObject.url = data.data.attributes.url;
        fileObject.filemime = data.data.attributes.filemime;
        fileObject.filesize = data.data.attributes.filesize;

        this.set('value', fileObject);
      });
    }
  }).drop(),
  actions: {
    valueChanged: function(value){
      this.get('uploadFile').perform(value);
    }
  }
});
