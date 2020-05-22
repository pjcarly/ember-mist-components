// @ts-ignore
import Uploader from "ember-uploader/uploaders/uploader";
import { dropTask } from "ember-concurrency-decorators";
import { computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { isEmpty } from "@ember/utils";
import { dasherize } from "@ember/string";
import { htmlSafe } from "@ember/template";
import BaseInput from "ember-field-components/components/BaseInput";
import File from "ember-mist-components/interfaces/file";
import { taskFor } from "ember-mist-components/utils/ember-concurrency";
import HttpService from "ember-mist-components/services/http";
import ToastService from "ember-mist-components/services/toast";

export default class InputFileDrupalComponent extends BaseInput {
  @service http!: HttpService;
  @service toast!: ToastService;

  type = "file-drupal";
  totalFiles: number = 0;
  activeFile?: File;

  multiple: boolean = false;
  modelName!: string;
  field!: string;

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

  @dropTask
  *uploadFile(files: any) {
    if (!isEmpty(files)) {
      const uploaderOptions = {
        type: "POST",
        ajaxSettings: {
          headers: this.headers,
        },
        url: this.uploadEndpoint,
      };

      const uploader = Uploader.extend(uploaderOptions).create();
      let fieldValue: File[] | File = [];

      let activeFile = 0;
      let shouldContinue = true;
      for (const file of files) {
        activeFile++;

        this.set("totalFiles", files.length);
        this.set("activeFile", activeFile);

        if (shouldContinue) {
          yield uploader
            .upload(file)
            .then((data: any) => {
              // @ts-ignore
              const fileObject: File = {
                id: data.data.id,
                filename: data.data.attributes.filename,
                uri: data.data.attributes.uri,
                url: data.data.attributes.url,
                filemime: data.data.attributes.filemime,
                filesize: data.data.attributes.filesize,
                hash: data.data.attributes.hash,
              };

              if (this.multiple) {
                // @ts-ignore
                fieldValue.push(fileObject);
              } else {
                fieldValue = fileObject;
                shouldContinue = false;
              }
            })
            .catch((error: any) => {
              let errorMessage = "File upload failed";

              if (error.responseJSON) {
                if ("error_description" in error.responseJSON) {
                  errorMessage = error.responseJSON.error_description;
                } else if ("error" in error.responseJSON) {
                  errorMessage = error.responseJSON.error;
                }
              }

              errorMessage = `(${htmlSafe(file.name)}) ${errorMessage}`;
              this.toast.error(errorMessage, errorMessage);
            });
        }
      }

      this.set("computedValue", fieldValue);
    }
  }

  @action
  deleteFile() {
    this.set("computedValue", null);
  }

  @action
  filesSelected(files: any) {
    taskFor(this.uploadFile).perform(files);
  }
}
