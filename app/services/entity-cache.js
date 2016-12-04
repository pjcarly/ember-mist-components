import Ember from 'ember';

export default Ember.Service.extend({
  clearReturnToModel(){
    this.set('returnToModel', null);
  },
  clearCachedModel(){
    this.set('cachedModel', null);
  },
  getReturnToModelAndClear(){
    let returnToModel = this.get('returnToModel');
    this.clearReturnToModel();
    return returnToModel;
  }
});
