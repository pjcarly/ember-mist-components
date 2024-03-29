import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { htmlSafe } from '@ember/template';
import BaseInput, {
  Arguments,
  OptionsArgument,
} from '@getflights/ember-field-components/components/BaseInput';
import FileModel from '@getflights/ember-mist-components/interfaces/file';
import File from 'ember-file-upload/file';
import { taskFor } from 'ember-concurrency-ts';
import HttpService from '@getflights/ember-mist-components/services/http';
import ToastService from '@getflights/ember-mist-components/services/toast';
import FileQueueService from 'ember-file-upload/services/file-queue';
import Queue from 'ember-file-upload/queue';
import { assert } from '@ember/debug';
import { cached } from '@glimmer/tracking';

export interface FileDrupalArguments extends Arguments {
  options: FileDrupalOptionsArgument;
}

export interface FileDrupalOptionsArgument extends OptionsArgument {
  field: string;
  modelName: string;
  multiple?: boolean;
  headers?: { [key: string]: string };
  endpoint?: string;
}

export default class InputFileDrupalComponent extends BaseInput<FileDrupalArguments> {
  @service http!: HttpService;
  @service toast!: ToastService;
  @service fileQueue!: FileQueueService;

  type = 'file-drupal';

  /**
   * The last active ember-file-upload queue that was used uploading files, null when nothing has been uploaded
   */
  private lastActiveQueue?: string;
  private activeFile?: File;

  constructor(owner: any, args: FileDrupalArguments) {
    super(owner, args);
    assert(
      "input-file-drupal.options 'field' and 'modelName' are required",
      args.options && args.options.field && args.options.modelName
    );
  }

  get queue(): Queue | null {
    if (this.lastActiveQueue) {
      return this.fileQueue.find(this.lastActiveQueue);
    }

    return null;
  }

  get totalFiles(): number {
    if (this.queue) {
      return <number>this.queue.files.length;
    }

    return 0;
  }

  get activeFilePositionInQueue(): number {
    if (this.activeFile && this.queue) {
      const position = this.queue.files.indexOf(this.activeFile);

      if (position !== -1) {
        return position + 1;
      }
    }

    return -1;
  }

  get mistFieldTarget(): string | undefined {
    return this.args.options.modelName && this.args.options.field
      ? dasherize(`${this.args.options.modelName}.${this.args.options.field}`)
      : undefined;
  }

  get fieldHeaders(): Map<string, string> {
    const returnValue = new Map();

    if (this.args.options && this.args.options.headers) {
      for (const key in this.args.options.headers) {
        returnValue.set(key, this.args.options.headers[key]);
      }
    }

    return returnValue;
  }

  get uploadEndpoint(): string {
    if (this.args.options && this.args.options.endpoint) {
      return `${this.http.endpoint}${this.args.options.endpoint}`;
    } else {
      return `${this.http.endpoint}file/files`;
    }
  }

  @cached
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

  get multipleUploads(): boolean {
    return this.args.options.multiple ?? false;
  }

  get headers(): { [s: string]: string } {
    const headers = new Map([...this.fieldHeaders, ...this.httpHeaders]);
    const mistFieldTarget = this.mistFieldTarget;

    if (mistFieldTarget) {
      headers.set('X-Mist-Field-Target', mistFieldTarget);
    }

    const returnValue: { [s: string]: string } = {};
    headers.forEach((value, key) => {
      returnValue[key] = value;
    });

    return returnValue;
  }

  @task({ enqueue: true, maxConcurrency: 1 })
  async uploadFile(file: File) {
    this.activeFile = file;

    if (file) {
      this.lastActiveQueue = file.queue?.name;

      await file
        .upload(this.uploadEndpoint, { headers: this.headers })
        .then((response: any) => {
          // @ts-ignore
          const fileObject: FileModel = {
            /** @ts-ignore */
            id: response.body.data.id,
            filename: response.body.data.attributes.filename,
            uri: response.body.data.attributes.uri,
            url: response.body.data.attributes.url,
            filemime: response.body.data.attributes.filemime,
            filesize: response.body.data.attributes.filesize,
            hash: response.body.data.attributes.hash,
          };

          this.setNewValue(fileObject);
        })
        .catch((error: any) => {
          if (file.queue) {
            file.queue.remove(file);
          }

          let errorMessage = 'File upload failed';
          if (error?.body?.errors && Array.isArray(error.body.errors) && error.body.errors.length > 0) {
            if ('detail' in error.body.errors[0]) {
              errorMessage = error.body.errors[0].detail;
            } else if ('code' in error.body.errors[0]) {
              errorMessage = error.body.errors[0].code;
            }
          }

          errorMessage = `(${htmlSafe(file.name)}) ${errorMessage}`;
          this.toast.error(errorMessage);
        });
    }
  }

  @action
  deleteFile(file: FileModel) {
    if (this.multipleUploads) {
      const values = <FileModel[]>this.args.value;
      const indexOfValue = values.indexOf(file);

      if (indexOfValue !== -1) {
        values.splice(indexOfValue, 1);

        if (values.length === 0) {
          this.setNewValue(null);
        } else {
          this.setNewValue([...values]);
        }
      }
    } else {
      this.setNewValue(null);
    }
  }

  @action
  fileSelected(file: File) {
    taskFor(this.uploadFile).perform(file);
  }
}
