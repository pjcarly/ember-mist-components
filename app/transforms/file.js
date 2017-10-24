import DS from 'ember-data';

const { isBlank } = Ember;
const { Transform } = DS;

export default Transform.extend({
  deserialize: function(serialized) {
    let file = {};

    if(!isBlank(serialized)) {
      file.id = serialized.id;
      file.filename = serialized.filename;
      file.uri = serialized.uri;
      file.url = serialized.url;
      file.filemime = serialized.filemime;
      file.filesize = serialized.filesize;
      file.hash = serialized.hash;
    }

    return file;
  },
  serialize: function(deserialized) {
    let serializedFile = {};

    if(!isBlank(deserialized)) {
      serializedFile['id'] = deserialized.id;
      serializedFile['filename'] = deserialized.filename;
      serializedFile['uri'] = deserialized.uri;
      serializedFile['url'] = deserialized.url;
      serializedFile['filemime'] = deserialized.filemimie;
      serializedFile['filesize'] = deserialized.filesize;
      serializedFile['hash'] = deserialized.hash;
    }

    return serializedFile;
  }
});
