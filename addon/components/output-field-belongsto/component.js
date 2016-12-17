import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import OfflineModelCacheMixin from 'ember-mist-components/mixins/offline-model-cache';

import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(FieldOutputComponent, OfflineModelCacheMixin, {
  store: Ember.inject.service(),
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  setInitialValue: task(function * (){
    const { field, model, store, storage } = this.getProperties('field', 'model', 'store', 'storage');
    const relationshipTypeName = ModelUtils.getParentModelTypeName(model, field);
    const id = model.belongsTo(field).id();

    yield this.get('checkOfflineCache').perform(store, storage, relationshipTypeName);

    if(!Ember.isBlank(id)){
      if(this.get('store').hasRecordForId(relationshipTypeName, id)){
        this.set('lookupValue', this.get('store').peekRecord(relationshipTypeName, id));
      } else {
        yield model.get(field).then((value) => {
          this.set('lookupValue', value);
        });
      }
    }
  }),
  route: Ember.computed('lookupValue', function(){
    const lookupValue = this.get('lookupValue');
    if(!Ember.isBlank(lookupValue)){
      return `${ModelUtils.getModelName(lookupValue)}.view`;
    }
  })
});
