import Ember from 'ember';

export default Ember.Mixin.create({
  resetController(controller) {
    this._super(...arguments);

    let model = controller.get('model');

    if (model.get('hasDirtyAttributes')) {
      model.rollbackAttributes();
    }

    if (model.get('isNew')) {
      this.store.unloadRecord(model);
    }
  }
});
