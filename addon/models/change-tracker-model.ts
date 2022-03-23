import ValidationModel from "@getflights/ember-attribute-validations/model/validation-model";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";
import ComputedProperty from "@ember/object/computed";
import { Promise } from "rsvp";
import { ChangedAttributes } from "ember-data";
import ModelChangeTrackerService from "../services/model-change-tracker";

// @important Change Tracking hasMany is tricky
// Default it is disabled, so you have to explicitly turn on tracking for hasMany, but keep in mind the following gotchas
// - If you have a multi-entity-reference field on an entity, that field is a hasMany relationship in Ember
//   because it is not tracked by default, if you navigate away from an edit, any dirty changes on that field will not be rolled back
// - If you enable hasMany tracking, all hasMany relationships will be tracked on that model, and will thus be rolled back if you navigate away
//   this also means that if for example you have a modelTableRelated, on a object, and you click on the "new" button, because you navigate to 
//   the new edit page, the hasMany of that modelTableRelated will also be rolled back, and the new relationship will not be filled in,
// - There is another final option in changeTracker, "only", with only you must explicitly define which relationships to track,
//   that way you can define which hasMany relationship to keep track of, but very important, you must also include all the belongsTo relationships
//   on that object, because belongsTo is tracked by default, but when you use "only", it only tracks the belongsTo relationships defined in "only"
export default abstract class ChangeTrackerModel extends ValidationModel {
  @service store!: Store;
  @service modelChangeTracker !: ModelChangeTrackerService;

  hasDirtyAttributes !: ComputedProperty<boolean, boolean>; // Set by Change Tracker Service on initialization
  hasDirtyRelations !: ComputedProperty<boolean, boolean>; // Set by Change Tracker Service on initialization

  init() {
    // @ts-ignore
    super.init();

    if (this.modelChangeTracker.isAutoSaveEnabled(this)) {
      this.initTracking();
    }
    if (this.modelChangeTracker.isIsDirtyEnabled(this)) {
      // this is experimental
      this.modelChangeTracker.initializeDirtiness(this);
    }

    this.setupTrackerMetaData();
    this.setupUnknownRelationshipLoadObservers();
  }

  /**
   * Did an attribute/association change?
   *
   * @param key the attribute/association name
   * @param changed optional ember-data changedAttribute object
   * @returns true if value changed
   */
  didChange(key: string, changed: ChangedAttributes | null, options?: any): boolean {
    return this.modelChangeTracker.didChange(this, key, changed, options);
  }

  /**
   * Did any attribute/association change?
   *
   * returns object with:
   *  {key: value} = {attribute: true}
   *
   * If the the attribute changed, it will be included in this object
   */
  modelChanges(): { [key: string]: boolean } | ChangedAttributes {
    const changed: ChangedAttributes | { [key: string]: boolean } = {};
    const changedAttributes = Object.assign({}, this.changedAttributes());
    const trackerInfo = this.modelChangeTracker.metaInfo(this);

    for (const key in changedAttributes) {
      changed[key] = changedAttributes[key];
    }

    for (const key in trackerInfo) {
      if (!changedAttributes[key] && trackerInfo.hasOwnProperty(key)) {
        if (this.didChange(key, changedAttributes)) {
          changed[key] = true;
        }
      }
    }

    return changed;
  }

  /**
   * Rollback all the changes on this model, for the keys you are
   * tracking.
   *
   * NOTE: Be sure you understand what keys you are tracking.
   * By default, tracker will save all keys, but if you set up
   * a model to 'only' track a limited set of keys, then the rollback
   * will only be limited to those keys
   *
   */
  rollback(): void {
    // @ts-ignore
    const isNew = <boolean>this.isNew;
    // @ts-ignore
    this.rollbackAttributes();
    if (isNew) {
      return;
    }
    const trackerInfo = this.modelChangeTracker.metaInfo(this);
    const rollbackData = this.modelChangeTracker.rollbackData(this, trackerInfo);
    const normalized = this.modelChangeTracker.normalize(this, rollbackData);
    this.store.push(normalized);
  }

  // alias for saveChanges method
  startTrack(): void {
    this.initTracking();
    this.saveChanges();
  }

  // Ember Data DS.Model events
  // http://api.emberjs.com/ember-data/3.10/classes/DS.Model/events
  //
  // Replaces deprecated Ember.Evented usage:
  // https://github.com/emberjs/rfcs/blob/master/text/0329-deprecated-ember-evented-in-ember-data.md
  // Related: https://github.com/emberjs/rfcs/pull/329
  initTracking(): void {
    // @ts-ignore
    this.didCreate = () => {
      this.saveOnCreate();
    };

    // @ts-ignore
    this.didUpdate = () => {
      this.saveOnUpdate();
    };

    // @ts-ignore
    this.didDelete = () => {
      this.clearSavedAttributes();
    };

    // @ts-ignore
    (this.ready = () => {
      this.setupTrackerMetaData();
      this.setupUnknownRelationshipLoadObservers();
    }),
      this.modelChangeTracker.setupTracking(this);
  }

  /**
   * Save the current state of the model
   *
   * NOTE: This is needed when manually pushing data
   * to the store and using Ember < 2.10
   *
   * options like => {except: 'company'}
   *
   * @param {Object} options
   */
  saveChanges(options?: any): void {
    this.modelChangeTracker.setupTracking(this);
    this.modelChangeTracker.saveChanges(this, options);
    this.modelChangeTracker.triggerIsDirtyReset(this);
  }

  saveTrackerChanges(options?: any): void {
    this.saveChanges(options);
  }

  /**
   * Get value of the last known value tracker is saving for this key
   *
   * @param key attribute/association name
   * @returns {*}
   */
  savedTrackerValue(key: string): any {
    return this.modelChangeTracker.lastValue(this, key);
  }

  // save state when model is loaded or created if using auto save
  setupTrackerMetaData(): void {
    if (this.modelChangeTracker.isIsDirtyEnabled(this)) {
      // this is experimental
      this.modelChangeTracker.initializeDirtiness(this);
    }
    if (this.modelChangeTracker.isAutoSaveEnabled(this)) {
      this.saveChanges();
    }
  }

  // watch for relationships loaded with data via links
  setupUnknownRelationshipLoadObservers(): void {
    // @ts-ignore
    this.eachRelationship((key) => {
      // @ts-ignore
      this.addObserver(key, this, "observeUnknownRelationshipLoaded");
    });
  }

  // when model updates, update the tracked state if using auto save
  saveOnUpdate(): void {
    if (this.modelChangeTracker.isAutoSaveEnabled(this) || this.modelChangeTracker.isIsDirtyEnabled(this)) {
      this.saveChanges();
    }
  }

  // when model creates, update the tracked state if using auto save
  saveOnCreate(): void {
    if (this.modelChangeTracker.isAutoSaveEnabled(this) || this.modelChangeTracker.isIsDirtyEnabled(this)) {
      this.saveChanges();
    }
  }

  // There is no didReload callback on models, so have to override reload
  reload(): Promise<this> {
    const promise = super.reload(...arguments);
    promise.then(() => {
      if (this.modelChangeTracker.isAutoSaveEnabled(this)) {
        this.saveChanges();
      }
    });
    return promise;
  }

  // when model deletes, remove any tracked state
  clearSavedAttributes(): void {
    this.modelChangeTracker.clear(this);
  }

  observeUnknownRelationshipLoaded(_: any, key: string /*, value, rev*/): void {
    if (this.modelChangeTracker.trackingIsSetup(this) && this.modelChangeTracker.isTracking(this, key)) {
      const saved = this.modelChangeTracker.saveLoadedRelationship(this, key);
      if (saved) {
        // @ts-ignore
        this.removeObserver(key, this, "observeUnknownRelationshipLoaded");
      }
    }
  }
}
