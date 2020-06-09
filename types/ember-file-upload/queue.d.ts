import EmberObject from "@ember/object";
import RSVP from "rsvp";
import FileQueueService from "ember-file-upload/services/file-queue";
import File from "ember-file-upload/file";
import NativeArray from "@ember/array/mutable";

declare module "ember-file-upload/queue" {
  export default class Queue extends EmberObject {
    /**
     * Flushes the `files` property if they have settled. This
     * will only flush files when all files have arrived at a terminus
     * of their state chart.
     */
    flush(): void;

    /**
     * The total size of all files currently being uploaded in bytes.
     */
    size: number;

    /**
     * The number of bytes that have been uploaded to the server.
     */
    loaded: number;

    /**
     * The current progress of all uploads, as a percentage in the
     * range of 0 to 100.
     */
    progress: number;

    fileQueue: FileQueueService;

    push(file: File): void;
    remove(file: File): void;

    /**
     * THe unique name of the Queue
     */
    name: string;

    /**
     * The list of files in the queue. This automatically gets
     * flushed when all the files in the queue have settled.
     */
    files: NativeArray<File>;
  }
}
