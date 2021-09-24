import Service from "@ember/service";
import { inject as service } from '@ember/service';
import HttpService from "./http";
import File from "@getflights/ember-mist-components/interfaces/file";
import { debug } from "@ember/debug";

export default class FileService extends Service {
  @service http !: HttpService;

  public async uploadDataUriAsFile(
    dataUri: string,
    fileName: string,
    target: string,
    endpoint?: string
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const blob = this.getBlobFromDataUri(dataUri);

      if (!blob) {
        reject();
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, fileName);

      return this.http
        .fetch(endpoint ?? `${this.http.endpoint}file/files`, "POST", formData, undefined, undefined, { 'X-Mist-Field-Target': target })
        .then((response: Response) => {
          return response.json().then((payload: any) => {
            // @ts-ignore
            const file: File = {
              // @ts-ignore
              id: payload.data.id,
              hash: payload.data.attributes.hash,
              url: payload.data.attributes.url,
              uri: payload.data.attributes.uri,
              filesize: payload.data.attributes.filesize,
              filename: payload.data.attributes.filename,
              filemime: payload.data.attributes.filemime,
            }

            resolve(file);
          });
        })
        .catch((error: Response) => {
          return error.text().then((payload) => {
            debug(payload);
            reject();
          });
        });
    });
  }

  /**
   * Converts a base64 string to a Blob
   */
  public getBlobFromBase64(base64: string, mime: string): Blob {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
      var slice = byteChars.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }

  /**
   * Converts a Data URI to a Blob, returns null if failed.
   */
  public getBlobFromDataUri(dataUri: string): Blob | null {
    const split = /data:(.*);base64,(.*)/.exec(dataUri);

    if (split) {
      return this.getBlobFromBase64(split[2], split[1]);
    }

    return null;
  }

  /**
   * Returns a mime from a Data Uri
   */
  public getMimeFromDataUri(dataUri: string): string | null {
    const split = /data:(.*);base64,(.*)/.exec(dataUri);

    if (split) {
      return split[1];
    }

    return null;
  }
}