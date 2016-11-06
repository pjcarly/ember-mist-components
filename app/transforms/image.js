import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    let file = {};

    if(!Ember.isBlank(serialized)) {
      file.id = serialized.id;
      file.filename = serialized.filename;
      file.uri = serialized.uri;
      file.url = serialized.url;
      file.filemime = serialized.filemime;
      file.filesize = serialized.filesize;
    }

    console.log(file);
    return file;
  },
  serialize: function(deserialized) {
    let serializedFile = {};

    if(!Ember.isBlank(deserialized)) {
      serializedFile['id'] = deserialized.id;
      serializedFile['filename'] = deserialized.filename;
      serializedFile['uri'] = deserialized.uri;
      serializedFile['url'] = deserialized.url;
      serializedFile['filemime'] = deserialized.filemimie;
      serializedFile['filesize'] = deserialized.filesize;
    }

    return serializedFile;
  }
});
