/* global swal */
import Model from 'ember-data/model';
import Mixin from '@ember/object/mixin';
import { getModelType, getDefaultIncludes, getModelName } from 'ember-field-components/classes/model-utils';
import { task, taskGroup } from 'ember-concurrency';
import { removeRecentlyViewed } from 'ember-mist-components/classes/recently-viewed';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { debug } from '@ember/debug';

export default Mixin.create({
  entityCache: service(),
  entityRouter: service(),
  store: service(),
  toast: service(),
  storage: service(),
  modelTasks: taskGroup().drop(),

  view: task(function * (model) {
    this.get('entityRouter').transitionToView(model);
  }).group('modelTasks'),
  edit: task(function * (model) {
    this.get('entityRouter').transitionToEdit(model);
  }).group('modelTasks'),
  delete: task(function * (model) {
    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this record!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: true
    }, function(){
      this.get('deleteWithoutConfirm').perform(model);
    }.bind(this));
  }).group('modelTasks'),
  deleteWithoutConfirm: task(function * (model) {
    const modelName = getModelName(model);
    const modelId = model.get('id');
    model.deleteRecord();
    yield model.save()
    .then(() => {
      this.successToast(`Success`, `Record deleted`);
      this.get('entityRouter').transitionToList(modelName);
      removeRecentlyViewed(modelName, modelId, this.get('storage'));
    })
    .catch((reason) => {
      this.logErrorMessage(`There was an error deleting your data`, reason.message);
    });
  }).group('modelTasks'),
  cancel: task(function * (target) {
    const returnToModel = this.get('entityCache').getReturnToModelAndClear();
    if(!isBlank(returnToModel)){
      target = returnToModel;
    }

    if(target instanceof Model) {
      if(!target.get('isNew')){
        this.get('entityRouter').transitionToView(target);
      } else {
        const modelName = getModelName(target);
        this.get('entityRouter').transitionToList(modelName);
      }
    } else {
      this.get('entityRouter').transitionToList(target);
    }
  }).group('modelTasks'),
  save: task(function * (model) {
    if(model.get('isDirty')) {
      yield model.save()
      .then(() => {
        this.successToast(`Success`, `Record saved`);
        this.get('entityRouter').transitionToView(model);
      })
      .catch((reason) => {
        this.logErrorMessage(`There was an error saving your information`, reason.message);
      });
    } else {
      this.get('entityRouter').transitionToView(model);
    }
  }).group('modelTasks'),
  new: task(function * (modelType) {
    this.get('entityRouter').transitionToCreate(modelType);
  }).group('modelTasks'),
  refresh: task(function * (model) {
    model.doRollback(); // To clear any potential dirty state (else the reload won't work)
    const modelName = getModelName(model);
    const store = this.get('store');
    const type = getModelType(modelName, store);

    let defaultIncludes = getDefaultIncludes(type);
    let options = {};

    // Lets also include the default includes
    if(defaultIncludes.length > 0) {
      options['include'] = defaultIncludes.join(',');
    }

    yield store.loadRecord(modelName, model.get('id'), options)
    .then(() => {
      this.infoToast(`Success`, `Record Refreshed`);
    })
    .catch((reason) => {
      this.logErrorMessage(`There was an error refreshing`, reason.message);
    });
  }).group('modelTasks'),
  invokeModelActionAndRefresh: task(function * (model, action) {
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
    .then(() => {
      this.successToast('Success', 'Action successful');
    })
    .catch((error) => {
      this.errorToast('Error', error);
    })

    yield model.reload();
  }).group('modelTasks'),
  invokeModelAction: task(function * (model, action) {
    const actionToInvoke = model.get(action).bind(model);
    yield actionToInvoke()
    .then(() => {
      this.successToast('Success', 'Action successful');
    })
    .catch((error) => {
      this.errorToast('Error', error);
    })
  }).group('modelTasks'),
  logErrorMessage(subject, message){
    this.errorToast(subject, message);
    debug(message);
  },
  successToast(subject, message){
    this.get('toast').success(message, subject);
  },
  infoToast(subject, message){
    this.get('toast').info(message, subject);
  },
  warningToast(subject, message){
    this.get('toast').warning(message, subject);
  },
  errorToast(subject, message){
    this.get('toast').error(message, subject);
  },
  actions: {
    print(model) {
      const title = document.title;
      document.title = model.get('name');
      window.print();
      document.title = title;
    }
  }
});
