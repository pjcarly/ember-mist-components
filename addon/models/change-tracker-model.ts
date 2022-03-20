import ValidationModel from "@getflights/ember-attribute-validations/model/validation-model";
import { inject as service } from "@ember/service";
import Store from "@ember-data/store";
import ChangeTrackerService from "../services/change-tracker";
import ComputedProperty from "@ember/object/computed";

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
  @service changeTracker !: ChangeTrackerService;

  hasDirtyAttributes !: ComputedProperty<boolean, boolean>; // Set by Change Tracker Service on initialization
  hasDirtyRelations !: ComputedProperty<boolean, boolean>; // Set by Change Tracker Service on initialization

  init() {
    // @ts-ignore
    super.init();

    if (this.changeTracker.isAutoSaveEnabled(this)) {
      this.initTracking();
    }
    if (this.changeTracker.isIsDirtyEnabled(this)) {
      // this is experimental
      this.changeTracker.initializeDirtiness(this);
    }

    this.setupTrackerMetaData();
    this.setupUnknownRelationshipLoadObservers();
  }

  /**
   * Did an attribute/association change?
   *
   * @param {String} key the attribute/association name
   * @param {Object} changed optional ember-data changedAttribute object
   * @returns {Boolean} true if value changed
   */
  didChange(key: string, changed: any, options?: any): boolean {
    return this.changeTracker.didChange(this, key, changed, options);
  }

  /**
   * Did any attribute/association change?
   *
   * returns object with:
   *  {key: value} = {attribute: true}
   *
   * If the the attribute changed, it will be included in this object
   *
   * @returns {*}
   */
  modelChanges() {
    // @ts-ignore
    const changed = Object.assign({}, this.changedAttributes());
    const trackerInfo = this.changeTracker.metaInfo(this);
    for (const key in trackerInfo) {
      if (!changed[key] && trackerInfo.hasOwnProperty(key)) {
        if (this.didChange(key, changed)) {
          // @ts-ignore
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
  rollback() {
    // @ts-ignore
    const isNew = <boolean>this.isNew;
    // @ts-ignore
    this.rollbackAttributes();
    if (isNew) {
      return;
    }
    const trackerInfo = this.changeTracker.metaInfo(this);
    const rollbackData = this.changeTracker.rollbackData(this, trackerInfo);
    const normalized = this.changeTracker.normalize(this, rollbackData);
    this.store.push(normalized);
  }

  // alias for saveChanges method
  startTrack() {
    this.initTracking();
    this.saveChanges();
  }

  // Ember Data DS.Model events
  // http://api.emberjs.com/ember-data/3.10/classes/DS.Model/events
  //
  // Replaces deprecated Ember.Evented usage:
  // https://github.com/emberjs/rfcs/blob/master/text/0329-deprecated-ember-evented-in-ember-data.md
  // Related: https://github.com/emberjs/rfcs/pull/329

  initTracking() {
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
      this.changeTracker.setupTracking(this);
  }

  /**
   * Save the current state of the model
   *
   * NOTE: This is needed when manually pushing data
   * to the store and ussing Ember < 2.10
   *
   * options like => {except: 'company'}
   *
   * @param {Object} options
   */
  saveChanges(options?: any) {
    this.changeTracker.setupTracking(this);
    this.changeTracker.saveChanges(this, options);
    this.changeTracker.triggerIsDirtyReset(this);
  }

  saveTrackerChanges(options?: any) {
    this.saveChanges(options);
  }

  /**
   * Get value of the last known value tracker is saving for this key
   *
   * @param {String} key attribute/association name
   * @returns {*}
   */
  savedTrackerValue(key: string) {
    return this.changeTracker.lastValue(this, key);
  }

  // save state when model is loaded or created if using auto save
  setupTrackerMetaData() {
    if (this.changeTracker.isIsDirtyEnabled(this)) {
      // this is experimental
      this.changeTracker.initializeDirtiness(this);
    }
    if (this.changeTracker.isAutoSaveEnabled(this)) {
      this.saveChanges();
    }
  }

  // watch for relationships loaded with data via links
  setupUnknownRelationshipLoadObservers() {
    // @ts-ignore
    this.eachRelationship((key) => {
      // @ts-ignore
      this.addObserver(key, this, "observeUnknownRelationshipLoaded");
    });
  }

  // when model updates, update the tracked state if using auto save
  saveOnUpdate() {
    if (this.changeTracker.isAutoSaveEnabled(this) || this.changeTracker.isIsDirtyEnabled(this)) {
      this.saveChanges();
    }
  }

  // when model creates, update the tracked state if using auto save
  saveOnCreate() {
    if (this.changeTracker.isAutoSaveEnabled(this) || this.changeTracker.isIsDirtyEnabled(this)) {
      this.saveChanges();
    }
  }

  // There is no didReload callback on models, so have to override reload
  reload() {
    // @ts-ignore
    const promise = super.reload(...arguments);
    promise.then(() => {
      if (this.changeTracker.isAutoSaveEnabled(this)) {
        this.saveChanges();
      }
    });
    return promise;
  }

  // when model deletes, remove any tracked state
  clearSavedAttributes() {
    this.changeTracker.clear(this);
  }

  observeUnknownRelationshipLoaded(_: any, key: string /*, value, rev*/) {
    if (this.changeTracker.trackingIsSetup(this) && this.changeTracker.isTracking(this, key)) {
      const saved = this.changeTracker.saveLoadedRelationship(this, key);
      if (saved) {
        // @ts-ignore
        this.removeObserver(key, this, "observeUnknownRelationshipLoaded");
      }
    }
  }
}
