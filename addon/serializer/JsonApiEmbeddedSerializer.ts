import { EmbeddedRecordsMixin } from "@ember-data/serializer/rest";
import JSONAPISerializer from "@ember-data/serializer/json-api";
import Store from "@ember-data/store";
import { isBlank } from "@ember/utils";
import { get } from "@ember/object";
import { debug } from "@ember/debug";
import { dasherize } from "@ember/string";
import DrupalModel from "@getflights/ember-mist-components/models/drupal-model";

/**
 * This is an extension for the JSON API serializer, where relationships marked as embedded will be serialized
 * into the response when creating/updating a record.
 *
 * When doing an update, embedded records will be unloaded from the store after the save.
 * But the response will have the embedded records included in the response.
 *
 * However, when creating a record with embedded relationships, related records will not be unloaded
 * - The problem is that we do not know the instance of the model doing the save, so we cant do the rollback
 * This must be handled by the application
 *  one way you could do this, is mark the relationship as rollback: true,
 *  this will delete unsaved records from the store when doing a transition
 */
export default class JsonApiEmbeddedSerializer extends JSONAPISerializer.extend(
  EmbeddedRecordsMixin
) {
  isEmbeddedRecordsMixinCompatible = true;
  attrs: any;

  serialize(snapshot: any /*, options*/) {
    // In the serialize response we check if embedded records are dirty, and decide if they need to be in the payload
    // @ts-ignore
    const json = super.serialize(...arguments);
    const attrs = this.attrs;
    const model = get(snapshot, "record");

    // No need to do anything when there is no id (in a POST) or no embedded relationships defined
    if (!isBlank(attrs) && !isBlank(model.id)) {
      const relationshipsToCheck = [];

      // We read the serializer for embedded relationships
      for (const relationshipName in attrs) {
        if (attrs[relationshipName].embedded === "always") {
          relationshipsToCheck.push(relationshipName);
        }
      }

      // Now we know which relationships are embedded
      // We check if they are dirty or not
      // If they arent dirty, we delete the key from the json, it shouldnt be transmitted in the PATCH
      relationshipsToCheck.forEach((relationshipToCheck) => {
        if (!model.hasDirtyEmbeddedRelationship(relationshipToCheck)) {
          // This relationship is clean, we delete the dasherized name from the payload.
          const dasherizedRelationshipName = dasherize(relationshipToCheck);
          // @ts-ignore
          delete json.data[dasherizedRelationshipName];
        }
      });
    }

    return json;
  }

  normalizeSaveResponse(
    store: Store,
    primaryModelClass: any,
    _payload: any,
    _id: string | number
  ) {
    const attrs = this.attrs;

    // Only if this serializer has attrs (needed by EmbeddedRecordsMixin)
    // If the payload doesn't include anything, we ignore this (just the model was returned, no includes)
    if (!isBlank(attrs)) {
      // We check the relationships that should be embedded, when they are of type hasMany
      // We will check the response, and unload all missing models in the response from the store
      // Models who aren't present are considered deleted in the backend, and should be removed locally
      let relationshipsToCheck: any = {};
      const relationshipsByName = get(
        primaryModelClass,
        "relationshipsByName"
      );
      for (const relationshipName in attrs) {
        if (
          attrs.hasOwnProperty(relationshipName) &&
          attrs[relationshipName].hasOwnProperty("embedded") &&
          attrs[relationshipName].embedded === "always" &&
          relationshipsByName.has(relationshipName)
        ) {
          const relationship = relationshipsByName.get(relationshipName);

          // Only hasMany are checked, this has no meaning for belongsTo
          if (relationship.kind === "hasMany") {
            relationshipsToCheck[relationship.type] = relationship;

            // Fix for when initial saves causes errors in the fragment adapter.
            store.unloadAll(relationship.type);
          }
        }
      }
    }

    // @ts-ignore
    return super.normalizeSaveResponse(...arguments);
  }

  normalizeDeleteRecordResponse(
    store: Store,
    primaryModelClass: any,
    _payload: any,
    id: string
  ) {
    const attrs = this.attrs;

    // Only if this serializer has attrs (needed by EmbeddedRecordsMixin)
    // And only if the id not is blank, for new models this has no meaning, as the record doesn't exist in the back-end yet
    // and will just be unloaded locally by the reset controller mixin
    if (!isBlank(attrs) && !isBlank(id)) {
      // We check the relationships that should be embedded, when they are of type hasMany
      let relationshipsToCheck: any = {};
      const relationshipsByName = get(primaryModelClass, "relationshipsByName");
      for (const relationshipName in attrs) {
        if (
          attrs[relationshipName].embedded === "always" &&
          relationshipsByName.has(relationshipName)
        ) {
          const relationship = relationshipsByName.get(relationshipName);

          // Only hasMany are checked, this has no meaning for belongsTo
          if (relationship.kind === "hasMany") {
            relationshipsToCheck[relationship.type] = relationship;
          }
        }
      }

      // Now that we have the relationships we need to check
      // we can check the localModel's local children for each relationship and unload them
      if (store.hasRecordForId(primaryModelClass.modelName, id)) {
        const localModel = store.peekRecord(primaryModelClass.modelName, id);
        for (const relationshipType in relationshipsToCheck) {
          const relationship = relationshipsToCheck[relationshipType];
          const localChildren = localModel.get(relationship.key);
          // Seriously no idea why the next statement needs toArray(), for some reason the enumerable returned above
          // Sometimes gave a null value instead of a child while looping it
          // by first casting it to array, and then looping it, everything worked fine, and all children were found
          if (!isBlank(localChildren)) {
            localChildren.toArray().forEach((localChild: DrupalModel) => {
              // the parent, and the children will be deleted by the back-end
              // but the children won't be automatically deleted locally, that is what we do here
              debug(
                // @ts-ignore
                `(serializer) Unloading ${localChild.name} because parent record was deleted`
              );
              store.unloadRecord(localChild);
            });
          }
        }
      }
    }

    // @ts-ignore
    return super.normalizeDeleteRecordResponse(...arguments);
  }
}
