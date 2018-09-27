import DS from 'ember-data';
import { isBlank } from '@ember/utils';

const { Transform } = DS;

export default Transform.extend({
  deserialize: function(serializedFiles) {
    let deserializedFiles = [];

    if(!isBlank(serializedFiles)) {
      for(const serializedFile of serializedFiles){
        if(!isBlank(serializedFile) && serializedFile.hasOwnProperty('id') && serializedFile.id > 0) {
          let deserializedFile = {};
          deserializedFile.id = serializedFile.id;
          deserializedFile.filename = serializedFile.filename;
          deserializedFile.url = serializedFile.url;
          deserializedFile.filemime = serializedFile.filemime;
          deserializedFile.filesize = serializedFile.filesize;
          deserializedFile.hash = serializedFile.hash;
          deserializedFiles.push(deserializedFile);
        }
      }
    }

    return deserializedFiles;
  },
  serialize: function(deserializedFiles) {
    let serializedFiles = [];

    if(!isBlank(deserializedFiles)) {
      for(const deserializedFile of deserializedFiles){
        if(!isBlank(deserializedFile) && deserializedFile.hasOwnProperty('id') && deserializedFile.id > 0) {
          let serializedFile = {};
          serializedFile['id'] = deserializedFile.id;
          serializedFile['filename'] = deserializedFile.filename;
          serializedFile['url'] = deserializedFile.url;
          serializedFile['filemime'] = deserializedFile.filemimie;
          serializedFile['filesize'] = deserializedFile.filesize;
          serializedFile['hash'] = deserializedFile.hash;
          serializedFiles.push(serializedFile);
        }
      }
    }

    return serializedFiles;
  }
});
