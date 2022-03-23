import Service from '@ember/service';
import { getOwner } from '@ember/application';
import Model from '../models/change-tracker-model';
import { A } from "@ember/array";
import { assert } from '@ember/debug';
import { isEmpty, typeOf } from "@ember/utils";
import { defineProperty } from '@ember/object';
import { inject as service } from '@ember/service';
import Store from "@ember-data/store";
import Ember from "ember";
import ApplicationInstance from '@ember/application/instance';
import { cached } from '@glimmer/tracking';
import Transform from "@ember-data/serializer/transform";
import Serializer from "@ember-data/serializer";
import { ChangedAttributes } from 'ember-data';

// import { didModelChange, didModelsChange, relationShipTransform, relationshipKnownState } from './utilities';

export const ModelTrackerKey = '-change-tracker';
export const RelationshipsKnownTrackerKey = '-change-tracker-relationships-known';

const alreadyTrackedRegex = /^-mf-|string|boolean|date|^number$/,
  knownTrackerOpts = A(['only', 'auto', 'except', 'trackHasMany', 'enableIsDirty']),
  defaultOpts = { trackHasMany: true, auto: false, enableIsDirty: false };

export type TrackerAttributeKey = { type: 'attribute', name: string };
export type TrackerRelationshipKey = { type: 'belongsTo' | 'hasMany', polymorphic?: boolean, knownState: { isKnown: (model: Model, key: string) => boolean } };

export type TrackerKeys = { [key: string]: TrackerAttributeKey | TrackerRelationshipKey };
export type TrackerMeta = (TrackerAttributeKey | TrackerRelationshipKey) & {
  transform: Transform<any, any> | { serialize(model: any, key: any, options?: any): any, deserialize(): void; }
}

export interface GlobalChangeTrackerConfig {
  trackHasMany?: boolean,
  auto?: boolean,
  enableIsDirty?: boolean
}

export interface ModelChangeTrackerConfig {
  trackHasMany?: boolean,
  auto?: boolean,
  enableIsDirty?: boolean,
  only?: string[],
  except?: string[]
}

/**
 * Helper class for change tracking models
 */
export default class ModelChangeTrackerService extends Service {

  @service store !: Store;

  /**
   * Get Ember application container
   */
  @cached
  get container(): ApplicationInstance {
    return getOwner(this);
  }

  /**
   * Get tracker configuration from Ember application configuration
   */
  private envConfig(): GlobalChangeTrackerConfig {
    const config = this.container.resolveRegistration('config:environment');
    // sometimes the config is not available ?? not sure why
    return config && config.changeTracker || {};
  }

  /**
   * Get tracker configuration that is set on the model
   */
  private modelConfig(model: Model): ModelChangeTrackerConfig {
    // @ts-ignore
    return model.changeTracker || {};
  }

  /**
   * Is this model in auto save mode?
   */
  public isAutoSaveEnabled(model: Model): boolean {
    const modelClass = this.getModelClass(model);

    if (modelClass.trackerAutoSave === undefined) {
      const options = this.options(model);
      modelClass.trackerAutoSave = options.auto;
    }

    return modelClass.trackerAutoSave;
  }

  /**
   * Is this model have isDirty option enabled?
   */
  public isIsDirtyEnabled(model: Model): boolean {
    // @ts-ignore
    if (model.constructor.trackerEnableIsDirty === undefined) {
      const options = this.options(model);
      // @ts-ignore
      model.constructor.trackerEnableIsDirty = options.enableIsDirty;
    }
    // @ts-ignore
    return model.constructor.trackerEnableIsDirty;
  }

  /**
   * A custom attribute should have a transform function associated with it.
   * If not, use object transform.
   *
   * A transform function is required for serializing and deserializing
   * the attribute in order to save past values and then renew them on rollback
   */
  private transformFn(attributeType?: string): Transform {
    const transformType = attributeType || 'object';
    return <Transform>this.container.lookup(`transform:${transformType}`);
  }

  /**
   * The rollback data will be an object with keys as attribute and relationship names
   * with values for those keys.
   *
   *    For example:
   *
   *    { id: 1, name: 'Acme Inc', company: 1, pets: [1,2] }
   *
   * Basically a REST style payload. So, convert that to JSONAPI so it can be
   * pushed to the store
   */
  public normalize(model: Model, data: ReturnType<ModelChangeTrackerService['rollbackData']>): {} {
    const serializer = <Serializer>this.container.lookup('serializer:-rest');
    serializer.set('store', model.store);
    return serializer.normalize(<any>model.constructor, data);
  }

  private getModelClass(model: Model): {
    trackerAutoSave: boolean,
    trackerEnableIsDirty: boolean,
    trackerKeys: { [key: string]: TrackerMeta },
    alreadySetupTrackingMeta: boolean,
    eachAttribute: (callback: (attribute: string, meta: { type: string }) => void) => void,
    eachRelationship: (callback: (key: string, relationship: { key: string, kind: 'hasMany' | 'belongsTo', options: { async?: boolean, polymorphic?: boolean } }) => void) => void,
    modelName: string
  } {
    return <any>model.constructor;
  }

  /**
   * Find the meta data for all keys or a single key (attributes/association)
   * that tracker is tracking on this model
   *
   * @returns all the meta info on this model that tracker is tracking
   */
  public metaInfo(model: Model): { [key: string]: TrackerMeta } {
    const modelClass = this.getModelClass(model);
    return (modelClass.trackerKeys || {});
  }

  /**
   * Find the meta data for all keys or a single key (attributes/association)
   * that tracker is tracking on this model
   *
   * @returns all the meta info on this model that tracker is tracking
   */
  public metaInfoForKey(model: Model, key: string): TrackerMeta | undefined {
    const metaInfo = this.metaInfo(model);

    if (metaInfo.hasOwnProperty(key)) {
      return metaInfo[key];
    }

    return;
  }

  /**
   * Find whether this key is currently being tracked.
   *
   * @returns true if this key is being tracked. false otherwise
   */
  public isTracking(model: Model, key: string): boolean {
    const modelClass = this.getModelClass(model)
    const info = (modelClass.trackerKeys || {});
    return !!info[key];
  }

  /**
   * On the model you can set options like:
   *
   *   changeTracker: {auto: true}
   *   changeTracker: {auto: true, enableIsDirty: true}
   *   changeTracker: {auto: true, only: ['info']}
   *   changeTracker: {except: ['info']}
   *   changeTracker: {except: ['info'], trackHasMany: true}
   *
   * In config environment you can set options like:
   *
   *   changeTracker: {auto: true, trackHasMany: false, enableIsDirty: true}
   *   // default is:  {auto: false, trackHasMany: true, enableIsDirty: false}
   *
   * The default is set to trackHasMany but not auto track, since
   * that is the most do nothing approach and when you do call `model.startTrack()`
   * it is assumed you want to track everything.
   *
   * Also, by default the isDirty computed property is not setup. You have to enable
   * it globally or on a model
   *
   */
  public options(model: Model) {
    let envConfig = this.envConfig();
    let modelConfig = this.modelConfig(model);
    let opts = Object.assign({}, defaultOpts, envConfig, modelConfig);

    let unknownOpts = Object.keys(opts).filter((v) => !knownTrackerOpts.includes(v));
    assert(`[ember-data-change-tracker] changeTracker options can have
      'only', 'except' , 'auto', 'enableIsDirty' or 'trackHasMany' but you are declaring: ${unknownOpts}`,
      isEmpty(unknownOpts)
    );

    return opts;
  }

  // has tracking already been setup on this model?
  public trackingIsSetup(model: Model): boolean {
    const modelClass = this.getModelClass(model);
    return modelClass.alreadySetupTrackingMeta;
  }

  /**
   * Setup tracking meta data for this model,
   * unless it's already been setup
   */
  public setupTracking(model: Model): void {
    if (!this.trackingIsSetup(model)) {
      // @ts-ignore
      model.constructor.alreadySetupTrackingMeta = true;
      let info = this.getTrackerInfo(model);
      // @ts-ignore
      model.constructor.trackerKeys = info.keyMeta;
      // @ts-ignore
      model.constructor.trackerAutoSave = info.autoSave;
      // @ts-ignore
      model.constructor.trackerEnableIsDirty = info.enableIsDirty;
    }
  }

  /**
   * Get the tracker meta data associated with this model
   */
  private getTrackerInfo(model: Model): { autoSave: boolean, enableIsDirty: boolean, keyMeta: { [key: string]: TrackerMeta } } {
    let [trackableInfo, hasManyList] = this.extractKeys(model);
    let trackerOpts = this.options(model);

    let all = Object.keys(trackableInfo);
    let except = trackerOpts.except || [];
    let only = trackerOpts.only || [...all];

    if (!trackerOpts.trackHasMany) {
      except = [...except, ...hasManyList];
    }

    all = [...all].filter(a => !except.includes(a));
    all = [...all].filter(a => only.includes(a));

    let keyMeta: { [key: string]: TrackerMeta } = {};
    Object.keys(trackableInfo).forEach(key => {
      if (all.includes(key)) {
        const info = trackableInfo[key];
        const transform = this.getTransform(model, key, info);

        const meta: TrackerMeta = Object.assign(info, { transform });

        keyMeta[key] = meta;
      }
    });

    const { enableIsDirty } = trackerOpts;
    return { autoSave: trackerOpts.auto, enableIsDirty, keyMeta };
  }

  /**
   * Go through the models attributes and relationships so see
   * which of these keys could be trackable
   *
   * @returns meta data about possible keys to track
   */
  private extractKeys(model: Model): [TrackerKeys, string[]] {
    const trackerKeys: TrackerKeys = {};
    const hasManyList: string[] = [];

    const modelConstructor = this.getModelClass(model);

    modelConstructor.eachAttribute((attribute, meta) => {
      if (!alreadyTrackedRegex.test(meta.type)) {
        trackerKeys[attribute] = { type: 'attribute', name: meta.type };
      }
    });

    modelConstructor.eachRelationship((key, relationship) => {
      trackerKeys[key] = {
        type: relationship.kind,
        polymorphic: relationship.options.polymorphic,
        knownState: relationshipKnownState[relationship.kind]
      };
      if (relationship.kind === 'hasMany') {
        hasManyList.push(key);
      }
    });

    return [trackerKeys, hasManyList];
  }

  /**
   * Get the transform for an attribute or association.
   * The attribute transforms are held by ember-data, and
   * the tracker uses custom transform for relationships
   *
   * @param model
   * @param key attribute/association name
   * @param info tracker meta data for this key
   */
  private getTransform(model: Model, key: string, info: TrackerAttributeKey | TrackerRelationshipKey): Transform | { serialize(model: any, key: any, options: any): any; deserialize(): void; } {
    let transform;

    if (info.type === 'attribute') {
      transform = this.transformFn(info.name);

      const modelClass = this.getModelClass(model);

      assert(`[ember-data-change-tracker] changeTracker could not find
      a ${info.name} transform function for the attribute '${key}' in
      model '${modelClass.modelName}'.
      If you are in a unit test, be sure to include it in the list of needs`,
        transform
      );
    } else {
      transform = relationShipTransform[info.type];
    }

    return transform;
  }

  /**
   * Did the key change since the last time state was saved?
   *
   * @param model
   * @param key attribute/association name
   * @param changed changed object
   * @param info model tracker meta data object
   */
  public didChange(model: Model, key: string, changed?: ChangedAttributes | null, info?: ReturnType<ModelChangeTrackerService['metaInfo']>): boolean {
    changed = changed || model.changedAttributes();
    if (changed[key]) {
      return true;
    }

    let keyInfo = info && info[key] || this.metaInfoForKey(model, key);
    if (keyInfo) {
      let current = this.serialize(model, key, keyInfo);
      let last = this.lastValue(model, key);
      switch (keyInfo.type) {
        case 'attribute':
          return didModelChange(current, last, false);
        case 'belongsTo':
          return didModelChange(current, last, keyInfo.polymorphic ?? false);
        case 'hasMany':
          return didModelsChange(current, last, keyInfo.polymorphic ?? false);
      }
    }

    return false;
  }

  /**
   * Serialize the value to be able to tell if the value changed.
   *
   * For attributes, using the transform function that each custom
   * attribute should have.
   *
   * For belongsTo, and hasMany using using custom transform
   *
   * @param model
   * @param key attribute/association name
   */
  public serialize(model: Model, key: string, keyInfo?: TrackerMeta): any {
    const info = keyInfo || this.metaInfoForKey(model, key);

    if (!info) {
      return;
    }

    let value;
    if (info.type === 'attribute') {
      // @ts-ignore
      value = info.transform.serialize(model.get(<any>key));
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
    } else {
      // @ts-ignore
      value = info.transform.serialize(model, key, info);
    }
    return value;
  }

  /**
   * Determine if the key represents data that the client knows about.
   *
   * For relationships that are async links it may be that they are yet to be
   * loaded and so a determination of 'changed' cannot be known
   *
   * @param model
   * @param key attribute/association name
   */
  private isKnown(model: Model, key: string, keyInfo?: TrackerMeta): boolean {
    const info = keyInfo || this.metaInfoForKey(model, key);

    if (!info) {
      return false;
    }

    let value;
    if (info.type === 'attribute') {
      value = true;
    } else {
      value = info.knownState.isKnown(model, key);
    }
    return value;
  }

  /**
   * Retrieve the last known value for this model key
   *
   * @param model
   * @param key attribute/association name
   */
  public lastValue(model: Model, key: string): any {
    return (model.get(<any>ModelTrackerKey) || {})[key];
  }

  /**
   * Retrieve the last known state for this model key
   *
   * @param model
   * @param key attribute/association name
   */
  private lastKnown(model: Model, key: string): any {
    return (model.get(<any>RelationshipsKnownTrackerKey) || {})[key];
  }

  /**
   * Gather all the rollback data
   */
  public rollbackData(model: Model, trackerInfo: ReturnType<ModelChangeTrackerService['metaInfo']>): { [key: string]: string | string[] | number | number[] } {
    let data: any = { id: model.id };
    Object.keys(trackerInfo).forEach((key) => {
      let keyInfo = trackerInfo[key];
      if (this.didChange(model, key, null, trackerInfo)) {
        // For now, blow away the hasMany relationship before resetting it
        // since just pushing new data is not resetting the relationship.
        // This slows down the hasMany rollback by about 25%, but still
        // fast => (~100ms) with 500 items in a hasMany
        if (keyInfo.type === 'hasMany') {
          model.set(<any>key, []);
        }
        let lastValue = this.lastValue(model, key);
        if (keyInfo.type === 'attribute' && !keyInfo.name) { // attr() undefined type
          // @ts-ignore
          lastValue = keyInfo.transform.deserialize(lastValue);
        }
        data[key] = lastValue;
      }
    });
    return data;
  }

  /**
   * Save change tracker attributes
   */
  public saveChanges(model: Model, { except = [] }: { except?: string[] } = {}): void {
    let metaInfo = this.metaInfo(model);
    let keys = Object.keys(metaInfo).filter(key => !except.includes(key));
    this.saveKeys(model, keys);
  }

  /**
   * Save the current relationship value into the hash only if it was previously
   * unknown (i.e. to be loaded async via a link)
   *
   * @param model
   * @param key association name
   * @returns true if the current relationship value was saved, false otherwise
   */
  public saveLoadedRelationship(model: Model, key: string): boolean {
    let saved = false;
    if (!this.lastKnown(model, key)) {
      let keyInfo = this.metaInfoForKey(model, key);
      if (this.isKnown(model, key, keyInfo)) {
        this.saveKey(model, key);
        saved = true;
      }
    }
    return saved;
  }

  /**
   * Manually trigger the isDirty properties to refresh themselves
   */
  public triggerIsDirtyReset(model: Model): void {
    model.notifyPropertyChange('hasDirtyAttributes');
    model.notifyPropertyChange('hasDirtyRelations');
  }

  /**
   * Save the value from an array of keys model's tracker hash
   * and save the relationship states if keys represents a relationship
   *
   * @param model
   * @param keys to save
   */
  private saveKeys(model: Model, keys: string[]) {
    let modelTracker = model.get(<any>ModelTrackerKey) || {},
      relationshipsKnownTracker = model.get(<any>RelationshipsKnownTrackerKey) || {},
      isNew = model.get('isNew');

    keys.forEach(key => {
      modelTracker[key] = isNew ? undefined : this.serialize(model, key);
      relationshipsKnownTracker[key] = isNew ? true : this.isKnown(model, key);
    });

    model.set(<any>ModelTrackerKey, modelTracker);
    model.set(<any>RelationshipsKnownTrackerKey, relationshipsKnownTracker);
    // model.setProperties({ [ModelTrackerKey]: modelTracker, [RelationshipsKnownTrackerKey]: relationshipsKnownTracker })
  }

  /**
   * Save current model key value in model's tracker hash
   * and save the relationship state if key represents a relationship
   *
   * @param model
   * @param key attribute/association name
   */
  private saveKey(model: Model, key: string) {
    this.saveKeys(model, [key]);
  }

  /**
   * Remove tracker hashes from the model's state
   *
   * @param model
   */
  public clear(model: Model) {
    model.set(<any>ModelTrackerKey, undefined);
    model.set(<any>RelationshipsKnownTrackerKey, undefined);
  }

  /**
   * Set up the computed properties:
   *
   *  'isDirty', 'hasDirtyAttributes', 'hasDirtyRelations'
   *
   * only if the application or model configuration has opted into
   * enable these properties, with the enableIsDirty flag
   *
   * @param model
   */
  public initializeDirtiness(model: Model) {
    const relations: string[] = [];
    const relationsObserver: string[] = [];
    const attrs: string[] = [];

    const modelClass = this.getModelClass(model);

    modelClass.eachRelationship((_name, descriptor) => {
      if (descriptor.kind === 'hasMany') {
        relations.push(descriptor.key);
        if (descriptor.options.async) {
          relationsObserver.push(descriptor.key + '.content.@each.id');
        } else {
          relationsObserver.push(descriptor.key + '.@each.id');
        }
      } else {
        relations.push(descriptor.key);
        relationsObserver.push(descriptor.key + '.content');
      }
    });

    modelClass.eachAttribute(name => {
      return attrs.push(name);
    });

    const hasDirtyRelations = function () {
      const changed = model.modelChanges();
      return !!relations.find(key => changed[key]);
    };

    const hasDirtyAttributes = function () {
      const changed = model.modelChanges();
      return !!attrs.find(key => changed[key]);
    };

    const isDirty = function () {
      return model.get('hasDirtyAttributes') || model.get('hasDirtyRelations');
    };

    const dirtyAttrsComputedProperty = attrs.concat([<any>hasDirtyAttributes]);
    console.log(dirtyAttrsComputedProperty);

    defineProperty(
      model,
      'hasDirtyAttributes',
      Ember.computed.apply(Ember, dirtyAttrsComputedProperty)
    );


    const dirtyRelationsComputedProperty = relationsObserver.concat([<any>hasDirtyRelations]);
    console.log(dirtyRelationsComputedProperty);

    defineProperty(
      model,
      'hasDirtyRelations',
      Ember.computed.apply(Ember, dirtyRelationsComputedProperty)
    );

    defineProperty(
      model,
      'isDirty',
      Ember.computed.apply(Ember, ['hasDirtyAttributes', 'hasDirtyRelations', isDirty])
    );

  }

}

type ModelLocalState = {
  id: number | string;
  type: string;
}

export const modelTransform = function (localState: ModelLocalState, polymorphic: boolean) {
  if (polymorphic) {
    return { id: localState.id, type: localState.type };
  }
  return localState.id;
};

export const relationShipTransform = {
  belongsTo: {
    serialize(model: Model, key: string, options: any) {
      const relationship = model.belongsTo(<any>key)
        // @ts-ignore
        .belongsToRelationship;
      const value = relationship.localState;
      return value && modelTransform(value, options.polymorphic);
    },

    deserialize() {
    }
  },
  hasMany: {
    serialize(model: Model, key: string, options: any) {
      const relationship = model.hasMany(<any>key)
        // @ts-ignore
        .hasManyRelationship;
      const value = relationship.currentState;
      return value && value.map((item: any) => modelTransform(item, options.polymorphic));
    },

    deserialize() {
    }
  }
};

export const relationshipKnownState = {
  belongsTo: {
    isKnown(model: Model, key: string): boolean {
      const belongsTo = model.belongsTo(<never>key);
      // @ts-ignore
      const relationship = belongsTo.belongsToRelationship;
      return !relationship.relationshipIsStale;
    }
  },
  hasMany: {
    isKnown(model: Model, key: string): boolean {
      const hasMany = model.hasMany(<never>key);
      // @ts-ignore
      const relationship = hasMany.hasManyRelationship;
      return !relationship.relationshipIsStale;
    }
  }
};

export const isEmptyModel = (value: Model): boolean => {
  if (typeOf(value) === 'object') {
    return Object.keys(value).length === 0;
  }
  return Ember.isEmpty(value);
};

export const didSerializedModelChange = (one: Model, other: Model, polymorphic: boolean) => {
  if (polymorphic) {
    // @ts-ignore
    return one.id !== other.id || one.type !== other.type;
  }
  return one !== other;
};

export const didModelsChange = function (one: Model, other: Model, polymorphic: boolean) {
  if (isEmptyModel(one) && isEmptyModel(other)) {
    return false;
  }

  // @ts-ignore
  if ((one && one.length) !== (other && other.length)) {
    return true;
  }

  // @ts-ignore
  for (let i = 0, len = one.length; i < len; i++) {
    // @ts-ignore
    if (didSerializedModelChange(one[i], other[i], polymorphic)) {
      return true;
    }
  }

  return false;
};

export const didModelChange = function (one: Model, other: Model, polymorphic: boolean) {
  if (isEmptyModel(one) && isEmptyModel(other)) {
    return false;
  }

  if (!one && other || one && !other) {
    return true;
  }

  return didSerializedModelChange(one, other, polymorphic);
};

