
/* global swal */
import Controller from "@ember/controller";
import Model from 'ember-data/model';
import Store from 'ember-data/store';
import DrupalModel from "ember-mist-components/models/drupal-model";
import EntityCacheService from "dummy/services/entity-cache";
import EntityRouterService from "dummy/services/entity-router";
import FieldInformationService from "ember-field-components/services/field-information";
import RecentlyViewedService from "dummy/services/recently-viewed";
import { inject as service } from '@ember-decorators/service';
import { isBlank } from '@ember/utils';
import { debug } from '@ember/debug';
import { task } from 'ember-concurrency-decorators';
import { dropTaskGroup } from "ember-concurrency-decorators";
import { action } from "@ember-decorators/object";
import { QueryParams } from "ember-mist-components/query/Query";

declare global {
  const swal: any;
}

export default class ModelController extends Controller {
  @service entityCache !: EntityCacheService;
  @service entityRouter !: EntityRouterService;
  @service fieldInformation !: FieldInformationService;
  @service recentlyViewed !: RecentlyViewedService;
  @service store !: Store;
  @service toast !: any;
  @service storage !: any;

  @dropTaskGroup modelTasks !: any;

  @task({ group: 'modelTasks' })
  * view(model : DrupalModel) {
    this.entityRouter.transitionToView(model);
  }

  @task({ group: 'modelTasks' })
  * edit(model: DrupalModel) {
    this.entityRouter.transitionToEdit(model);
  }

  @task({ group: 'modelTasks' })
  * delete(model: DrupalModel) {
    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this record!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: true
    }, function() {
      this.deleteWithoutConfirm.perform(model);
    }.bind(this));
  }

  @task({ group: 'modelTasks' })
  * deleteWithoutConfirm(model: DrupalModel) {
    const modelName = this.fieldInformation.getModelName(model);
    model.deleteRecord();
    yield model.save()
    .then(() => {
      this.successToast(`Success`, `Record deleted`);
      this.entityRouter.transitionToList(modelName);

      this.recentlyViewed.removeRecentlyViewed(model, model.id);
    })
    .catch((reason: any) => {
      this.logErrorMessage(`There was an error deleting your data`, reason.message);
    });
  }

  @task({ group: 'modelTasks' })
  * cancel(target: string | DrupalModel ) {
    const returnToModel = this.entityCache.getReturnToModelAndClear();
    if(!isBlank(returnToModel)) {
      target = returnToModel;
    }

    if(target instanceof Model) {
      if(!target.isNew) {
        this.entityRouter.transitionToView(target);
      } else {
        const modelName = this.fieldInformation.getModelName(target);
        this.entityRouter.transitionToList(modelName);
      }
    } else {
      this.entityRouter.transitionToList(target);
    }
  }

  @task({ group: 'modelTasks' })
  * save(model: DrupalModel) {
    model.hasDirtyEmbeddedRelationships();

    if(model.get('isDirtyOrDeleted') || model.hasDirtyEmbeddedRelationships()) {
      yield model.save()
      .then(() => {
        this.successToast(`Success`, `Record saved`);
        this.entityRouter.transitionToView(model);
      })
      .catch((reason: any) => {
        this.logErrorMessage(`There was an error saving your information`, reason.message);
      });
    } else {
      this.entityRouter.transitionToView(model);
    }
  }

  @task({ group: 'modelTasks' })
  * new(modelName: string) {
    this.entityRouter.transitionToCreate(modelName);
  }

  @task({ group: 'modelTasks' })
  * refresh(model: DrupalModel) {
    model.rollback(); // To clear any potential dirty state (else the reload won't work)
    const modelName = this.fieldInformation.getModelName(model);
    const defaultIncludes = this.fieldInformation.getDefaultIncludes(modelName);

    const options : QueryParams = {};

    // Lets also include the default includes
    if(defaultIncludes.length > 0) {
      options['include'] = defaultIncludes.join(',');
    }

    yield this.store.loadRecord(modelName, model.get('id'), options)
    .then(() => {
      this.infoToast(`Success`, `Record Refreshed`);
    })
    .catch((reason: any) => {
      this.logErrorMessage(`There was an error refreshing`, reason.message);
    });
  }

  @task({ group: 'modelTasks' })
  * invokeModelActionAndRefresh(model: DrupalModel, action: string) {
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
    .then(() => {
      this.successToast('Success', 'Action successful');
    })
    .catch((error: any) => {
      this.errorToast('Error', error);
    })

    yield model.reload();
  }

  @task({ group: 'modelTasks' })
  * invokeModelAction(model: DrupalModel, action: string) {
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
    .then(() => {
      this.successToast('Success', 'Action successful');
    })
    .catch((error: any) => {
      this.errorToast('Error', error);
    })
  }

  logErrorMessage(subject: string, message: string) {
    this.errorToast(subject, message);
    debug(message);
  }

  successToast(subject: string, message: string) {
    this.get('toast').success(message, subject);
  }

  infoToast(subject: string, message: string) {
    this.get('toast').info(message, subject);
  }

  warningToast(subject: string, message: string) {
    this.get('toast').warning(message, subject);
  }

  errorToast(subject: string, message: string) {
    this.get('toast').error(message, subject);
  }

  @action
  print(model: DrupalModel) {
    const title = document.title;
    document.title = model.name;
    window.print();
    document.title = title;
  }
}