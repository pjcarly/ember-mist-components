import Service from "@ember/service";
import RSVP from "rsvp";
import NativeArray from "@ember/array/mutable";
import File from "ember-file-upload/file";
import Queue from "ember-file-upload/queue";

declare module "ember-file-upload/services/file-queue" {
  export default class FileQueueService extends Service {
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

    /**
     * The list of all files in queues. This automatically gets
     * flushed when all the files in the queue have settled.
     */
    files: NativeArray<File>;

    /**
     * All the queues created by the platform
     */
    queues: NativeArray<Queue>;

    /**
     * Returns a queue with the given name
     */
    find(name: string): Queue | null;

    /**
     * Create a new queue with the given name.
     */
    create(name: string): Queue;
  }
}
