/* jshint noyield:true */
/* global swal */
import Ember from 'ember';
import DS from 'ember-data';
import { task, taskGroup } from 'ember-concurrency';
import { getModelName } from 'ember-field-components/classes/model-utils';
import Push from 'pushjs';

export default Ember.Mixin.create({
  entityRouter: Ember.inject.service(),

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
    let modelName = getModelName(model);
    model.deleteRecord();
    yield model.save()
    .then(() => {
      this.get('entityRouter').transitionToList(modelName);
    })
    .catch((reason) => {
      Push.create(`There was an error deleting your information`, {
        timeout: 4000,
        body: `${reason.message}`
      });
      console.log(reason.message); // TODO: change to Ember.debug after beta
    });
  }).group('modelTasks'),
  cancel: task(function * (target) {
    if(target instanceof DS.Model) {
      if(!target.get('isNew')){
        this.get('entityRouter').transitionToView(target);
      } else {
        let modelName = getModelName(target);
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
      Push.create(`There was an error saving your information`, {
        timeout: 4000,
        body: `${reason.message}`
      });
      console.log(reason.message); // TODO: change to Ember.debug after beta
    });
  }).group('modelTasks'),
  new: task(function * (modelType) {
    this.get('entityRouter').transitionToCreate(modelType);
  }).group('modelTasks'),
  refresh: task(function * (model) {
    model.rollbackAttributes(); // To clear any potential dirty state (else the reload won't work)
    yield model.reload();
  }).group('modelTasks')
});
