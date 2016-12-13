import Ember from 'ember';
import ModelUtils from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
const { camelize } = Ember.String;

export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  init(){
    this._super(...arguments);
    this.get('setInitialValue').perform();
  },
  relationshipModelType: Ember.computed('model', 'field', function(){
    return ModelUtils.getParentModelTypeName(this.get('model'), this.get('field'));
  }),
  setInitialValue: task(function * (){
    let field = this.get('field');
    let model = this.get('model');
    let store = this.get('store');

    const relationshipType = ModelUtils.getParentModelType(model, field, store);
    const relationshipTypeName = ModelUtils.getParentModelTypeName(model, field);

    // first we check if the modelType is cacheable, and if so, lets check the cache, and push them in the store if not yet done so
    if(ModelUtils.modelTypeIsCacheable(relationshipType) && !ModelUtils.modelTypeHasBeenLoadedFromCache(relationshipType)){
      // So the modelType is Cache, and hasn't already been loaded
      const localKey = camelize(`${relationshipTypeName}_store_cache`);
      const localCache = this.get('storage').get(localKey);
      if(!Ember.isBlank(localCache)) {
        // we found something locally
        store.push(localCache);
      } else {
        // nothing found locally, let's ask the server for initial data
        yield store.findAll(relationshipTypeName, {reload: true}).then((records) => {
          if(!Ember.isBlank(records) && records.get('length') > 0){
            // we found data, let's build a valid jsonapi document
            let payload = {data: []};
            var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);
            records.forEach((record) => {

              let serializedRecord = record.serialize({includeId: true}).data
              serializedRecord.type = inflector.singularize(serializedRecord.type);

              payload.data.push(serializedRecord);
            });

            // and store it locally for later use
            this.get('storage').set(localKey, payload);
          }
        });
      }

      // and finally we set the cached flag
      ModelUtils.modelTypeHasBeenLoadedFromCache(relationshipType);
    }

    let id = model.belongsTo(field).id(); // todo returns blank after clearing field and rolling back attributes (when it should be the initial value)
    if(!Ember.isBlank(id)){
      if(store.hasRecordForId(relationshipTypeName, id)){
        this.set('lookupValue', store.peekRecord(relationshipTypeName, id));
      } else {
        yield model.get(field).then((value) => {
          this.set('lookupValue', value);
        });
      }
    }
  }),
  actions: {
    valueChanged: function(value){
      let field = this.get('field');
      let model = this.get('model');

      model.set(field, value);
      this.set('lookupValue', value);
    }
  }
});
