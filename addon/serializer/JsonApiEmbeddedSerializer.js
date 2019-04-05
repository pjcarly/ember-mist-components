import EmbeddedRecordsMixin from 'ember-data/serializers/embedded-records-mixin';
import JSONAPISerializer from 'ember-data/serializers/json-api';
import { isBlank } from '@ember/utils';
import { get } from '@ember/object';
import { debug } from '@ember/debug';
import { dasherize } from '@ember/string';

export default JSONAPISerializer.extend(EmbeddedRecordsMixin, {
  serialize(snapshot/*, options*/) {
    // In the serialize response we check if embedded records are dirty, and decide if they need to be in the payload
    const json = this._super(...arguments);
    const attrs = this.get('attrs');
    const model = get(snapshot, 'record');

    // No need to do anything when there is no id (in a POST) or no embedded relationships defined
    if(!isBlank(attrs) && !isBlank(model.get('id'))) {
      const relationshipsToCheck = [];

      // We read the serializer for embedded relationships
      for(const relationshipName in attrs) {
        if(attrs[relationshipName].embedded === 'always') {
          relationshipsToCheck.push(relationshipName);
        }
      }

      // Now we know which relationships are embedded
      // We check if they are dirty or not
      // If they arent dirty, we delete the key from the json, it shouldnt be transmitted in the PATCH
      relationshipsToCheck.forEach((relationshipToCheck) => {
        if(!model.hasDirtyEmbeddedRelationship(relationshipToCheck)) {
          // This relationship is clean, we delete the dasherized name from the payload.
          const dasherizedRelationshipName = dasherize(relationshipToCheck);
          delete json.data[dasherizedRelationshipName];
        }
      });
    }

    return json;
  },
  normalizeSaveResponse(store, primaryModelClass, payload, id) {
    const attrs = this.get('attrs');

    // Only if this serializer has attrs (needed by EmbeddedRecordsMixin)
    // If the payload doesn't include anything, we ignore this (just the model was returned, no includes)
    // And only if the id not is blank, for new models this has no meaning, as the record don't exist in the back-end yet
    if(!isBlank(attrs) && !isBlank(id)) {
      // We check the relationships that should be embedded, when they are of type hasMany
      // We will check the response, and unload all missing models in the response from the store
      // Models who aren't present are considered deleted in the backend, and should be removed locally
      let relationshipsToCheck = {};
      const relationshipsByName = get(primaryModelClass, 'relationshipsByName');
      for(const relationshipName in attrs) {
        if(attrs[relationshipName].embedded === 'always' && relationshipsByName.has(relationshipName)) {
          const relationship = relationshipsByName.get(relationshipName);

          // Only hasMany are checked, this has no meaning for belongsTo
          if(relationship.kind === 'hasMany') {
            relationshipsToCheck[relationship.type] = relationship;
          }
        }
      }

      // Now we'll get the ids included per type from the response
      let idsPerType = {};
      if(payload.hasOwnProperty('included')) {
        payload.included.forEach((includedPayload) => {
          if(relationshipsToCheck.hasOwnProperty(includedPayload.type)) {
            if(!idsPerType.hasOwnProperty(includedPayload.type)) {
              idsPerType[includedPayload.type] = [];
            }

            idsPerType[includedPayload.type].push(includedPayload.id);
          }
        });
      }

      // Now that we have the relationships we need to check, and the ids returned by the back-end
      // we can check the localModel's local children for each relationship
      // see if the ids are present in the response we got from the payload
      // and unload them if needed
      if(store.hasRecordForId(primaryModelClass.modelName, id)) {
        const localModel = store.peekRecord(primaryModelClass.modelName, id);
        for(const relationshipType in relationshipsToCheck) {
          const relationship = relationshipsToCheck[relationshipType];
          const returnedIds = idsPerType.hasOwnProperty(relationshipType) ? idsPerType[relationshipType] : [];
          const localChildren = localModel.get(relationship.key);
          // Seriously no idea why the next statement needs toArray(), for some reason the enumerable returned above
          // Sometimes gave a null value instead of a child while looping it
          // by first casting it to array, and then looping it, everything worked fine, and all children were found
          if(!isBlank(localChildren)) {
            localChildren.toArray().forEach((localChild) => {
              const childId = localChild.get('id');
              // When the local child's id is blank, we also unload the model
              // this means that the record is newly created locally, and was created in the back-end (as the response is succesful)
              // but there is no way of mapping the local children with the ids of included records.
              // we just unload them, and the newly created, included models will just be added to the store later on
              if(isBlank(childId) || isBlank(returnedIds) || !returnedIds.includes(childId)) {
                debug(`(serializer) Unloading ${localChild.get('name')} because ${isBlank(childId) ? 'id was blank': 'id wasn\'t returned in included hash'}`);
                store.unloadRecord(localChild);
              }
            });
          }
        }
      }
    }

    return this._super(...arguments);
  },
  normalizeDeleteRecordResponse(store, primaryModelClass, payload, id) {
    const attrs = this.get('attrs');

    // Only if this serializer has attrs (needed by EmbeddedRecordsMixin)
    // And only if the id not is blank, for new models this has no meaning, as the record doesn't exist in the back-end yet
    // and will just be unloaded locally by the reset controller mixin
    if(!isBlank(attrs) && !isBlank(id)) {
      // We check the relationships that should be embedded, when they are of type hasMany
      let relationshipsToCheck = {};
      const relationshipsByName = get(primaryModelClass, 'relationshipsByName');
      for(const relationshipName in attrs) {
        if(attrs[relationshipName].embedded === 'always' && relationshipsByName.has(relationshipName)) {
          const relationship = relationshipsByName.get(relationshipName);

          // Only hasMany are checked, this has no meaning for belongsTo
          if(relationship.kind === 'hasMany') {
            relationshipsToCheck[relationship.type] = relationship;
          }
        }
      }

      // Now that we have the relationships we need to check
      // we can check the localModel's local children for each relationship and unload them
      if(store.hasRecordForId(primaryModelClass.modelName, id)) {
        const localModel = store.peekRecord(primaryModelClass.modelName, id);
        for(const relationshipType in relationshipsToCheck) {
          const relationship = relationshipsToCheck[relationshipType];
          const localChildren = localModel.get(relationship.key);
          // Seriously no idea why the next statement needs toArray(), for some reason the enumerable returned above
          // Sometimes gave a null value instead of a child while looping it
          // by first casting it to array, and then looping it, everything worked fine, and all children were found
          if(!isBlank(localChildren)) {
            localChildren.toArray().forEach((localChild) => {
              // the parent, and the children will be deleted by the back-end
              // but the children won't be automatically deleted locally, that is what we do here
              debug(`(serializer) Unloading ${localChild.get('name')} because parent record was deleted`);
              store.unloadRecord(localChild);
            });
          }
        }
      }
    }

    return this._super(...arguments);
  }
});
