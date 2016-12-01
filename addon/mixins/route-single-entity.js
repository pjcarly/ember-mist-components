import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';

export default Ember.Mixin.create({
  model(params) {
    const entityName = this.get('entityName');
    const type = ModelUtils.getModelType(entityName, this.get('store'));
    let defaultIncludes = ModelUtils.getDefaultIncludes(type);
    let options = {};

    if(defaultIncludes.length > 0) {
      options['include'] = defaultIncludes.join(',');
    }

    return this.store.findRecord(entityName, params[`${entityName}_id`], options);
  }
});
