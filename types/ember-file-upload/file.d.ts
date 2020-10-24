import EmberObject from "@ember/object";
import RSVP from "rsvp";
import Queue from "ember-file-upload/queue";

declare module "ember-file-upload/file" {
  export default class File extends EmberObject {
    id: string;
    name: string;
    size: number;
    type: string;
    extension: string;
    loaded: number;
    progress: number;
    state:
      | `queued`
      | `uploading`
      | `timed_out`
      | `aborted`
      | `uploaded`
      | `failed`;
    source: `browse` | `drag-and-drop` | `web` | `data-url` | `blob`;
    queue?: Queue;
    uploadBinary(url: string, opts: any): RSVP.Promise<any>;
    upload(url: string, opts: any): RSVP.Promise<any>;
    readAsArrayBuffer(): RSVP.Promise<ArrayBuffer>;
    readAsDataURL(): RSVP.Promise<string>;
    readAsBinaryString(): RSVP.Promise<string>;
    readAsText(): RSVP.Promise<string>;
  }
}
