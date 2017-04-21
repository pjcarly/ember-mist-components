/* jshint noyield:true */
import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { task } from 'ember-concurrency';
const { Component, inject, isBlank, isEmpty, getOwner } = Ember;

export default Component.extend(FieldInputComponent, {
  session: inject.service(),
  ajax: inject.service(),

  deleteFile: task(function * (){
    let value = this.get('value');

    if(!isBlank(value.id)){
      this.set('value', null);
    }
  }).drop(),
  uploadFile: task(function * (files){
    if (!isEmpty(files)) {
      let config = getOwner(this).resolveRegistration('config:environment');

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
