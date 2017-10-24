/* jshint noyield:true */
import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { inject } = Ember;
const { isBlank } = Ember;
const { isEmpty } = Ember;
const { getOwner } = Ember;
const { service } = inject;

export default Component.extend(FieldInputComponent, {
  ajax: service(),
  toast: service(),

  deleteFile: task(function * (){
    let value = this.get('value');

    if(!isBlank(value.id)){
      this.set('value', null);
    }
  }).drop(),
  uploadFile: task(function * (files){
    if (!isEmpty(files)) {
      let ajax = this.get('ajax');
      ajax.setHeaders();

      let uploaderOptions = {
        type: 'POST',
        ajaxSettings: {
          headers: ajax.get('headers')
        }
      };

      // lets check for a possible other endpoint
      const componentOptions = this.get('options');

      if(!isBlank(componentOptions) && componentOptions.hasOwnProperty('endpoint')) {
        uploaderOptions['url'] = `${ajax.get('endpoint')}${componentOptions.endpoint}`;
      } else {
        // no alternative endpoint found. Lets use the default one
        uploaderOptions['url'] = `${ajax.get('endpoint')}file/files`;
      }

      let uploader = EmberUploader.Uploader.extend(uploaderOptions).create();

      yield uploader.upload(files[0]).then((data) => {
        let fileObject = {};
        fileObject.id = data.data.id;
        fileObject.filename = data.data.attributes.filename;
        fileObject.uri = data.data.attributes.uri;
        fileObject.url = data.data.attributes.url;
        fileObject.filemime = data.data.attributes.filemime;
        fileObject.filesize = data.data.attributes.filesize;

        this.set('value', fileObject);
      })
      .catch((error) => {
        let errorMessage = 'File upload failed';

        if(error.responseJSON) {
          if('error_description' in error.responseJSON){
            errorMessage = error.responseJSON.error_description;
          } else if('error' in error.responseJSON){
            errorMessage = error.responseJSON.error;
          }
        }

        this.get('toast').error(errorMessage, errorMessage);
      });
    }
  }).drop(),
  actions: {
    valueChanged: function(value){
      this.get('uploadFile').perform(value);
    }
  }
});
