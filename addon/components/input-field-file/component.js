/* jshint noyield:true */
import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { task } from 'ember-concurrency';

const { Component, inject, isBlank, isEmpty, getOwner } = Ember;
const { service } = inject;

export default Component.extend(FieldInputComponent, {
  session: service(),
  ajax: service(),

  deleteFile: task(function * (){
    let value = this.get('value');

    if(!isBlank(value.id)){
      this.set('value', null);
    }
  }).drop(),
  uploadFile: task(function * (files){
    if (!isEmpty(files)) {
      let config = getOwner(this).resolveRegistration('config:environment');
      let ajax = this.get('ajax');
      ajax.setHeaders();

      var uploader = EmberUploader.Uploader.extend({
        url: `${config.apiEndpoint}file/files`,
        type: 'POST',
        ajaxSettings: {
          headers: ajax.get('headers')
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
