import Transform from "@ember-data/serializer/transform";
import { isBlank } from "@ember/utils";

export default class FileTransform extends Transform {
  deserialize(serialized: any | null) {
    let file: any | null = {};

    if (!isBlank(serialized)) {
      file.id = serialized.id;
      file.filename = serialized.filename;
      file.url = serialized.url;
      file.filemime = serialized.filemime;
      file.filesize = serialized.filesize;
      file.hash = serialized.hash;
    } else {
      file = null;
    }

    return file;
  }

  serialize(deserialized: any | null) {
    let serializedFile: any | null = {};

    if (!isBlank(deserialized)) {
      serializedFile["id"] = deserialized.id;
      serializedFile["filename"] = deserialized.filename;
      serializedFile["url"] = deserialized.url;
      serializedFile["filemime"] = deserialized.filemimie;
      serializedFile["filesize"] = deserialized.filesize;
      serializedFile["hash"] = deserialized.hash;
    } else {
      serializedFile = null;
    }

    return serializedFile;
  }
}
