import FieldInformationService from "ember-field-components/services/field-information";
import Model from "ember-data/model";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import { or } from "@ember/object/computed";
import { getOwner } from "@ember/application";
import { inject as service } from "@ember/service";
import { validationModel } from "ember-attribute-validations/decorators/validation-model";
import { loadableModel } from "ember-mist-components/decorators/loadable-model";

@validationModel
@loadableModel
export default abstract class MistModel extends Model {
  @service fieldInformation!: FieldInformationService;

  @computed()
  get hasViewRoute(): boolean {
    return this.hasRoute("view");
  }

  @computed()
  get viewRouteName(): string {
    return this.getRouteName("view");
  }

  @computed("isNew")
  get isExisting(): boolean {
    // @ts-ignore
    return !this.get("isNew");
  }

  @computed("errors.[]")
  get hasErrors(): boolean {
    // @ts-ignore
    return this.errors.get("length") > 0;
  }

  @computed()
  get embeddedRelationships(): string[] {
    const embeddedRelationships: string[] = [];

    const modelName = this.fieldInformation.getModelName(this);
    // @ts-ignore
    const serializer = this.store.serializerFor(modelName);
    const attrs = serializer.attrs;

    if (isBlank(attrs)) {
      return embeddedRelationships;
    }

    for (const relationshipName in attrs) {
      embeddedRelationships.push(relationshipName);
    }

    return embeddedRelationships;
  }

  @or("isDirty", "isDeleted")
  isDirtyOrDeleted!: boolean;

  /**
   * Rollbacks all dirty attributes, and possible child models that are dirty
   */
  rollback() {
    // We override the rollback method provided by the ember-data-change-tracker
    // Where we rollback child records which have the rollback option in the relationship meta
    // @ts-ignore
    this.eachRelationship((name: string, descriptor: any) => {
      if (
        descriptor.options.hasOwnProperty("rollback") &&
        descriptor.options.rollback
      ) {
        // @ts-ignore
        const childModels = this.get(name);
        if (!isBlank(childModels)) {
          // Seriously no idea why the next statement needs toArray(), for some reason the enumerable returned above
          // Sometimes gave a null value instead of a child while looping it
          // by first casting it to array, and then looping it, everything worked fine, and all children were found
          childModels.toArray().forEach((childModel: MistModel) => {
            childModel.rollback();
          });
        }
      }
    });

    // Now we call the super, which does the rollback on the current model
    // @ts-ignore ()
    super.rollback();
  }

  /**
   * This method makes a copy of the current model, sets all the fields and belongsto relationships the same and returns the copy. The existing model is unchanged
   */
  copy(): MistModel {
    const modelName = this.fieldInformation.getModelName(this);
    // @ts-ignore
    const copy = this.store.createRecord(modelName);

    // @ts-ignore
    this.eachAttribute((attributeName: string) => {
      // @ts-ignore
      const attributeValue = this.get(attributeName);

      copy.set(attributeName, attributeValue);
    });

    // @ts-ignore
    this.eachRelationship((relationshipName: string, meta: any) => {
      // @ts-ignore
      const relationship = this.get(relationshipName);

      if (meta.kind === "belongsTo") {
        copy.set(relationshipName, relationship);
      }
    });

    return copy;
  }

  /**
   * Clears all the belongsto relationship values
   */
  // @ts-ignore
  clearRelationships() {
    // @ts-ignore
    this.eachRelationship((relationshipName: string, descriptor: any) => {
      if (descriptor.kind === "belongsTo") {
        // @ts-ignore
        this.set(relationshipName, null);
        // @ts-ignore
        this.errors.remove(relationshipName);
      }
    });
  }

  /**
   * Clears all the attribute values on this model
   */
  clearAttributes() {
    // @ts-ignore
    this.eachAttribute((attributeName: string) => {
      // @ts-ignore
      this.set(attributeName, null);
      // @ts-ignore
      this.errors.remove(attributeName);
    });
  }

  /**
   * This functhasDirtyEmbeddedRelationshipsion checks whether the embedded relationships
   * (which are being saved in 1 call with the main model) are dirty or deleted.
   */
  hasDirtyEmbeddedRelationships(): boolean {
    return !this.embeddedRelationships.some((relationshipName) => {
      return !this.hasDirtyEmbeddedRelationship(relationshipName);
    });
  }

  /**
   * Validate all the embedded relationships
   */
  validateEmbeddedRelationships(): boolean {
    return !this.embeddedRelationships.some((relationshipName) => {
      return !this.validateEmbeddedRelationship(relationshipName);
    });
  }

  /**
   * Validate a provided relationship on this model
   * @param relationshipName The name of the relationship you want to validate
   */
  validateEmbeddedRelationship(relationshipNameToValidate: string): boolean {
    let isValid = true;

    // @ts-ignore
    this.eachRelationship((relationshipName: string, meta: any) => {
      if (relationshipName === relationshipNameToValidate) {
        if (meta.kind === "belongsTo") {
          // @ts-ignore
          const relatedModel = this.get(relationshipName);
          isValid = relatedModel ? relatedModel.validate() : true;
        } else if (meta.kind === "hasMany") {
          // @ts-ignore
          const relatedModels = this.get(relationshipName);
          if (relatedModels) {
            isValid = !relatedModels
              .toArray()
              // @ts-ignore
              .some((relatedModel: MistModel) => !relatedModel.validate());
          } else {
            isValid = true;
          }
        }
      }
    });

    return isValid;
  }

  /**
   * Checks the provided (embedded) relationship for dirtyness
   * @param relationshipName The relationship you want to check
   */
  hasDirtyEmbeddedRelationship(relationshipName: string): boolean {
    // @ts-ignore
    return this.get(relationshipName)
      .toArray()
      .some((relatedModel: MistModel) => {
        return relatedModel.isDirtyOrDeleted;
      });
  }

  /**
   * Checks if a modelroute exists
   * @param routeName THe route
   */
  hasRoute(routeName: string): boolean {
    // This property will check if a route exists for this model type based on the name of the model type
    return !isBlank(
      getOwner(this).lookup(
        `route:${this.fieldInformation.getModelName(this)}.${routeName}`
      )
    );
  }

  /**
   *
   * @param routeName
   */
  getRouteName(routeName: string): string {
    return `${this.fieldInformation.getModelName(this)}.${routeName}`;
  }
}
