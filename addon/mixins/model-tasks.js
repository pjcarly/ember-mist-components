/* jshint noyield:true */
/* global swal */
import Ember from 'ember';
import DS from 'ember-data';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task, taskGroup } from 'ember-concurrency';
import { getModelName } from 'ember-field-components/classes/model-utils';
import Push from 'pushjs';

const { Mixin, inject, isBlank, debug } = Ember;

export default Mixin.create({
  entityCache: inject.service(),
  entityRouter: inject.service(),
  store: inject.service(),
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
    model.deleteRecord();
    yield model.save()
    .then(() => {
      this.get('entityRouter').transitionToList(modelName);
    })
    .catch((reason) => {
      this.logMessage(`There was an error saving your information`, reason.message);
    });
  }).group('modelTasks'),
  cancel: task(function * (target) {
    const returnToModel = this.get('entityCache').getReturnToModelAndClear();
    if(!isBlank(returnToModel)){
      target = returnToModel;
    }

    if(target instanceof DS.Model) {
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
    yield model.save()
    .then(() => {
      this.get('entityRouter').transitionToView(model);
    })
    .catch((reason) => {
      this.logMessage(`There was an error saving your information`, reason.message);
    });
  }).group('modelTasks'),
  new: task(function * (modelType) {
    this.get('entityRouter').transitionToCreate(modelType);
  }).group('modelTasks'),
  refresh: task(function * (model) {
    model.doRollback(); // To clear any potential dirty state (else the reload won't work)
    const modelName = getModelName(model);
    const store = this.get('store');
    const type = ModelUtils.getModelType(modelName, store);

    let defaultIncludes = ModelUtils.getDefaultIncludes(type);
    let options = {};

    // Lets also include the default includes
    if(defaultIncludes.length > 0) {
      options['include'] = defaultIncludes.join(',');
    }

    yield store.findRecord(modelName, model.get('id'), options);
  }).group('modelTasks'),
  logMessage(subject, message){
    Push.create(subject, {
      timeout: 4000,
      body: message
    });
    debug(message);
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
