/* jshint noyield:true */
import Ember from 'ember';
import EmberUploader from 'ember-uploader';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { computed } = Ember;
const { inject } = Ember;
const { isBlank } = Ember;
const { isEmpty } = Ember;
const { getOwner } = Ember;
const { service } = inject;
const { String } = Ember;
const { dasherize } = String;
const { htmlSafe } = String;

export default Component.extend({
  ajax: service(),
  toast: service(),
  fieldHeaderValue: computed('modelName', 'field', function(){
    const { modelName, field } = this.getProperties('modelName', 'field');

    return !isBlank(modelName) && !isBlank(field) ? dasherize(`${modelName}.${field}`) : null;
  }),
  deleteFile: task(function * (){
    this.get('valueChanged')(null);
  }).drop(),
  uploadFile: task(function * (files){
    if (!isEmpty(files)) {
      let ajax = this.get('ajax');
      ajax.setHeaders();
      let headers = ajax.get('headers');
      const fieldHeaderValue = this.get('fieldHeaderValue');

      if(!isBlank(fieldHeaderValue)) {
        headers['X-Mist-Field-Target'] = fieldHeaderValue;
      }

      let uploaderOptions = {
        type: 'POST',
        ajaxSettings: {
          headers: headers
        }
      };

      // lets check for a possible other endpoint
      const componentOptions = this.get('options');
      if(!isBlank(componentOptions) && componentOptions.endpoint) {
        uploaderOptions['url'] = `${ajax.get('endpoint')}${componentOptions.endpoint}`;
      } else {
        // no alternative endpoint found. Lets use the default one
        uploaderOptions['url'] = `${ajax.get('endpoint')}file/files`;
      }

      let uploader = EmberUploader.Uploader.extend(uploaderOptions).create();
      let fieldValue = [];

      let activeFile = 0;
      let shouldContinue = true;
      for(let file of files) {
        activeFile++;

        this.set('totalFiles', files.length);
        this.set('activeFile', activeFile);

        if(shouldContinue) {
          yield uploader.upload(file).then((data) => {
            let fileObject = {};
            fileObject.id = data.data.id;
            fileObject.filename = data.data.attributes.filename;
            fileObject.uri = data.data.attributes.uri;
            fileObject.url = data.data.attributes.url;
            fileObject.filemime = data.data.attributes.filemime;
            fileObject.filesize = data.data.attributes.filesize;
            fileObject.hash = data.data.attributes.hash;

            if(this.get('multiple')) {
              fieldValue.push(fileObject);
            } else {
              fieldValue = fileObject;
              shouldContinue = false;
            }
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

            errorMessage = `(${htmlSafe(file.name)}) ${errorMessage}`;
            this.get('toast').error(errorMessage, errorMessage);
          });
        }
      }

      this.get('valueChanged')(fieldValue);
    }
  }).drop(),
  actions: {
    valueChanged: function(value){
      this.get('uploadFile').perform(value);
    }
  }
});
