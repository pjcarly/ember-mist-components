/* global swal */
import Controller from "@ember/controller";
import Model from "ember-data/model";
import Store from "ember-data/store";
import DrupalModel from "ember-mist-components/models/drupal-model";
import EntityCacheService from "ember-mist-components/services/entity-cache";
import EntityRouterService from "ember-mist-components/services/entity-router";
import FieldInformationService from "ember-field-components/services/field-information";
import RecentlyViewedService from "ember-mist-components/services/recently-viewed";
import { inject as service } from "@ember/service";
import { debug } from "@ember/debug";
import { task, dropTaskGroup } from "ember-concurrency-decorators";
import { action } from "@ember/object";
import { QueryParams } from "ember-mist-components/query/Query";
import { taskFor } from "ember-concurrency-ts";
import ToastService from "ember-mist-components/services/toast";

declare global {
  const swal: any;
}

export default class ModelController extends Controller {
  @service entityCache!: EntityCacheService;
  @service entityRouter!: EntityRouterService;
  @service fieldInformation!: FieldInformationService;
  @service recentlyViewed!: RecentlyViewedService;
  @service store!: Store;
  @service toast!: ToastService;
  @service storage!: any;

  @dropTaskGroup modelTasks!: any;

  @task({ group: "modelTasks" })
  *view(model: DrupalModel) {
    this.entityRouter.transitionToView(model);
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *edit(model: DrupalModel) {
    this.entityRouter.transitionToEdit(model);
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *delete(model: DrupalModel) {
    swal(
      {
        title: "Are you sure?",
        text: "You will not be able to recover this record!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        allowOutsideClick: true,
      },
      function (this: ModelController) {
        taskFor(this.deleteWithoutConfirm).perform(model);
      }.bind(this)
    );
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *deleteWithoutConfirm(model: DrupalModel) {
    const modelName = this.fieldInformation.getModelName(model);
    // @ts-ignore
    model.deleteRecord();
    yield model
      // @ts-ignore
      .save()
      .then(() => {
        this.successToast(`Success`, `Record deleted`);
        this.entityRouter.transitionToList(modelName);

        const modelClass = this.fieldInformation.getModelClassForModel(model);
        // @ts-ignore
        this.recentlyViewed.removeRecentlyViewed(modelClass, model.id);
      })
      .catch((reason: any) => {
        this.logErrorMessage(
          `There was an error deleting your data`,
          reason.message
        );
      });
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *cancel(target: string | Model) {
    const returnToModel = this.entityCache.getReturnToModelAndClear();
    if (returnToModel) {
      target = returnToModel;
    }

    if (target instanceof Model) {
      if (!target.isNew) {
        this.entityRouter.transitionToView(target);
      } else {
        const modelName = this.fieldInformation.getModelName(target);
        this.entityRouter.transitionToList(modelName);
      }
    } else {
      this.entityRouter.transitionToList(target);
    }
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *save(model: DrupalModel) {
    const afterSaveModel = this.entityCache.getAfterSaveModelAndClear();

    model.hasDirtyEmbeddedRelationships();

    if (
      // @ts-ignore
      model.get("isDirtyOrDeleted") ||
      model.hasDirtyEmbeddedRelationships()
    ) {
      // @ts-ignore
      const validModel = model.validate();
      // TODO: Fix issue #8 first
      //const validEmbeddedModels = model.validateEmbeddedRelationships();
      const validEmbeddedModels = true;

      if (!validModel || !validEmbeddedModels) {
        this.errorToast("Error", "You have validation errors");
        return;
      }

      yield model
        // @ts-ignore
        .save()
        .then(() => {
          this.successToast(`Success`, `Record saved`);

          if (afterSaveModel) {
            this.entityRouter.transitionToView(afterSaveModel);
          } else {
            this.entityRouter.transitionToView(model);
          }
        })
        .catch((reason: any) => {
          this.logErrorMessage(
            `There was an error saving your information`,
            reason.message
          );
        });
    } else {
      if (afterSaveModel) {
        this.entityRouter.transitionToView(afterSaveModel);
      } else {
        this.entityRouter.transitionToView(model);
      }
    }
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *new(modelName: string) {
    this.entityRouter.transitionToCreate(modelName);
  }

  @task
  *refresh(model: DrupalModel) {
    model.rollback(); // To clear any potential dirty state (else the reload won't work)
    const modelName = this.fieldInformation.getModelName(model);
    const defaultIncludes = this.fieldInformation.getDefaultIncludes(modelName);

    const options: QueryParams = {};

    // Lets also include the default includes
    if (defaultIncludes.length > 0) {
      options["include"] = defaultIncludes.join(",");
    }

    yield this.store
      // @ts-ignore
      .loadRecord(modelName, model.get("id"), options)
      .then(() => {
        this.infoToast(`Success`, `Record Refreshed`);
      })
      .catch((reason: any) => {
        this.logErrorMessage(`There was an error refreshing`, reason.message);
      });
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *invokeModelActionAndRefresh(model: DrupalModel, action: string) {
    // @ts-ignore
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
      .then(() => {
        this.successToast("Success", "Action successful");
      })
      .catch((error: any) => {
        this.errorToast("Error", error);
      });

    yield taskFor(this.refresh).perform(model);
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *invokeModelAction(model: DrupalModel, action: string) {
    // @ts-ignore
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
      .then(() => {
        this.successToast("Success", "Action successful");
      })
      .catch((error: any) => {
        this.errorToast("Error", error);
      });
  }

  // @ts-ignore
  @task({ group: "modelTasks" })
  *invokeDownloadAction(model: DrupalModel, action: string, filename: string) {
    // @ts-ignore
    const actionToInvoke = model.get(action).bind(model);

    let blob = null;

    yield actionToInvoke().then((response: Response) => {
      return response.blob().then((data) => {
        blob = new Blob([data], { type: "octet/stream" });
      });
    });

    const url = URL.createObjectURL(blob);

    const a = document.body.appendChild(document.createElement("a"));
    a.download = filename;
    // @ts-ignore
    a.style = "display: none";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  logErrorMessage(subject: string, message: string) {
    this.errorToast(subject, message);
    debug(message);
  }

  successToast(subject: string, message: string) {
    this.toast.success(message, subject);
  }

  infoToast(subject: string, message: string) {
    this.toast.info(message, subject);
  }

  warningToast(subject: string, message: string) {
    this.toast.warning(message, subject);
  }

  errorToast(subject: string, message: string) {
    this.toast.error(message, subject);
  }

  @action
  print(model: DrupalModel) {
    const title = document.title;
    // @ts-ignore
    document.title = model.name;
    window.print();
    document.title = title;
  }
}
