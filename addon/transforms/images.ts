import Transform from "ember-data/transform";
import { isBlank } from "@ember/utils";

export default class ImagesTransform extends Transform {
  deserialize(serializedFiles: Array<any> | null) {
    const deserializedFiles = [];

    if (serializedFiles) {
      for (const serializedFile of serializedFiles) {
        if (
          !isBlank(serializedFile) &&
          serializedFile.hasOwnProperty("id") &&
          serializedFile.id > 0
        ) {
          const deserializedFile: any = {};
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
  }

  serialize(deserializedFiles: Array<any> | null) {
    const serializedFiles = [];

    if (deserializedFiles) {
      for (const deserializedFile of deserializedFiles) {
        if (
          !isBlank(deserializedFile) &&
          deserializedFile.hasOwnProperty("id") &&
          deserializedFile.id > 0
        ) {
          const serializedFile: any = {};
          serializedFile["id"] = deserializedFile.id;
          serializedFile["filename"] = deserializedFile.filename;
          serializedFile["url"] = deserializedFile.url;
          serializedFile["filemime"] = deserializedFile.filemimie;
          serializedFile["filesize"] = deserializedFile.filesize;
          serializedFile["hash"] = deserializedFile.hash;
          serializedFiles.push(serializedFile);
        }
      }
    }

    return serializedFiles;
  }
}
