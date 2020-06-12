import { task } from "ember-concurrency-decorators";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isEmpty } from "@ember/utils";
import { dasherize } from "@ember/string";
import { htmlSafe } from "@ember/template";
import BaseInput from "ember-field-components/components/BaseInput";
import FileModel from "ember-mist-components/interfaces/file";
import File from "ember-file-upload/file";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";
import HttpService from "ember-mist-components/services/http";
import ToastService from "ember-mist-components/services/toast";
import FileQueueService from "ember-file-upload/services/file-queue";
import Queue from "ember-file-upload/queue";

export default class InputFileDrupalComponent extends BaseInput {
  @service http!: HttpService;
  @service toast!: ToastService;
  @service fileQueue!: FileQueueService;

  type = "file-drupal";

  /**
   * The last active ember-file-upload queue that was used uploading files, null when nothing has been uploaded
   */
  lastActiveQueue?: string;

  activeFile?: File;

  multiple: boolean = false;
  modelName!: string;
  field!: string;

  @computed("lastActiveQueue")
  get queue(): Queue | null {
    if (this.lastActiveQueue) {
      return this.fileQueue.find(this.lastActiveQueue);
    }

    return null;
  }

  @computed("queue")
  get totalFiles(): number {
    if (this.queue) {
      return <number>this.queue.files.length;
    }

    return 0;
  }

  @computed("queue", "activeFile")
  get activeFilePositionInQueue(): number {
    if (this.activeFile && this.queue) {
      const position = this.queue.files.indexOf(this.activeFile);

      if (position !== -1) {
        return position + 1;
      }
    }

    return -1;
  }

  @computed("modelName", "field")
  get mistFieldTarget(): string | undefined {
    return this.modelName && this.field
      ? dasherize(`${this.modelName}.${this.field}`)
      : undefined;
  }

  @computed("options.headers")
  get fieldHeaders(): Map<string, string> {
    const returnValue = new Map();

    if (this.options && this.options.headers) {
      for (const key in this.options.headers) {
        returnValue.set(key, this.options.headers[key]);
      }
    }

    return returnValue;
  }

  @computed("options.endpoint", "http.endpoint")
  get uploadEndpoint(): string {
    if (this.options && this.options.endpoint) {
      return `${this.http.endpoint}${this.options.endpoint}`;
    } else {
      return `${this.http.endpoint}file/files`;
    }
  }

  @computed()
  get httpHeaders(): Map<string, string> {
    const returnValue = new Map();
    const httpHeaders = this.http.headers;

    if (httpHeaders) {
      for (const key in httpHeaders) {
        returnValue.set(key, httpHeaders[key]);
      }
    }

    return returnValue;
  }

  @computed("fieldHeaders", "httpHeaders", "mistFieldTarget")
  get headers(): { [s: string]: string } {
    const headers = new Map([...this.fieldHeaders, ...this.httpHeaders]);

    if (this.mistFieldTarget) {
      headers.set("X-Mist-Field-Target", this.mistFieldTarget);
    }

    const returnValue: { [s: string]: string } = {};
    headers.forEach((value, key) => {
      returnValue[key] = value;
    });

    return returnValue;
  }

  @task({ enqueue: true, maxConcurrency: 3 })
  *uploadFile(file: File) {
    this.set("activeFile", file);

    if (!isEmpty(file)) {
      this.set("lastActiveQueue", file.queue.name);

      yield file
        .upload(this.uploadEndpoint, { headers: this.headers })
        .then((response: any) => {
          // @ts-ignore
          const fileObject: FileModel = {
            id: response.body.data.id,
            filename: response.body.data.attributes.filename,
            uri: response.body.data.attributes.uri,
            url: response.body.data.attributes.url,
            filemime: response.body.data.attributes.filemime,
            filesize: response.body.data.attributes.filesize,
            hash: response.body.data.attributes.hash,
          };

          let fieldValue = this.computedValue;
          if (this.multiple) {
            fieldValue = [...fieldValue, fileObject];
          } else {
            fieldValue = fileObject;
          }

          this.set("computedValue", fieldValue);
        })
        .catch((error: any) => {
          file.queue.remove(file);

          let errorMessage = "File upload failed";
          if (error.responseJSON) {
            if ("error_description" in error.responseJSON) {
              errorMessage = error.responseJSON.error_description;
            } else if ("error" in error.responseJSON) {
              errorMessage = error.responseJSON.error;
            }
          }

          errorMessage = `(${htmlSafe(file.name)}) ${errorMessage}`;
          this.toast.error(errorMessage);
        });
    }
  }

  @action
  deleteFile(file: FileModel) {
    if (this.multiple) {
      const values = <FileModel[]>this.computedValue;
      const indexOfValue = values.indexOf(file);

      if (indexOfValue !== -1) {
        values.splice(indexOfValue, 1);

        if (values.length === 0) {
          this.set("computedValue", null);
        } else {
          this.set("computedValue", [...values]);
        }
      }
    } else {
      this.set("computedValue", null);
    }
  }

  @action
  fileSelected(file: File) {
    taskFor(this.uploadFile).perform(file);
  }
}
