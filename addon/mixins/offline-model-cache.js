import Mixin from '@ember/object/mixin';
import { modelTypeIsCacheable, modelTypeWasLoaded, modelTypeHasBeenLoadedFromCache } from 'ember-field-components/classes/model-utils';
import { task } from 'ember-concurrency';
import { singularize } from 'ember-inflector';
import { isBlank } from '@ember/utils';
import { camelize } from '@ember/string';

export default Mixin.create({
  checkOfflineCache: task(function * (store, offlineCache, modelTypeName){
    const modelType = store.modelFor(modelTypeName);
    // first we check if the modelType is cacheable, and if so, lets check the cache, and push them in the store if not yet done so
    if(modelTypeIsCacheable(modelType) && !modelTypeHasBeenLoadedFromCache(modelType)){
      // So the modelType is cacheable, and hasn't already been loaded
      const localKey = camelize(`${modelTypeName}_store_cache`);
      const localCache = offlineCache.get(localKey);
      if(!isBlank(localCache)) {
        // we found something locally
        store.pushPayload(localCache);
      } else {
        // nothing found locally, let's ask the server for initial data
        // findAll on store, will push the found records in the store by default,
        // we don't need to do that manually afterwards
        yield store.loadAll(modelTypeName, {reload: true}).then((records) => {
          if(!isBlank(records) && records.get('length') > 0){
            // we found data, let's build a valid jsonapi document
            let payload = {data: []};
            records.forEach((record) => {
              let serializedRecord = record.serialize({includeId: true}).data;
              serializedRecord.type = singularize(serializedRecord.type);
              payload.data.push(serializedRecord);
            });

            // and store it locally for later use
            offlineCache.set(localKey, payload);
          }
        });
      }

      // and finally we set the cached flag
      modelTypeWasLoaded(modelType);
    }
  })
});
