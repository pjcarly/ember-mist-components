import Ember from 'ember';
import { task, taskGroup } from 'ember-concurrency';
import { getModelName } from 'ember-field-components/classes/model-utils';

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
    yield model.save();
    this.get('entityRouter').transitionToList(modelName);
  }).group('modelTasks'),
  cancel: task(function * (target) {
    if(target instanceof DS.Model) {
      this.get('entityRouter').transitionToView(target);
    } else {
      this.get('entityRouter').transitionToList(target);
    }
  }).group('modelTasks'),
  save: task(function * (model) {
    yield model.save();
    this.get('entityRouter').transitionToView(model);
  }).group('modelTasks'),
  new: task(function * (modelType) {
    this.get('entityRouter').transitionToCreate(modelType);
  }).group('modelTasks'),
  refresh: task(function * (model) {
    model.rollbackAttributes(); // To clear any potential dirty state (else the reload won't work)
    yield model.reload();
  }).group('modelTasks')
});
