import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';
import { getModelName } from 'ember-field-components/classes/model-utils';

const { Route } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, SingleEntityRouteMixin, ScrollToTop, {
  entityCache: service(),
  storage: service(),
  model(params){
    return this._super(...arguments).catch((error) => {
      const entityType = this.get('entityName');
      if(!isBlank(entityType)) {
        const idParam = `${entityType}_id`;
        if(!isBlank(idParam) && params.hasOwnProperty(idParam)) {
          const id = params[idParam];
          if(!isBlank(id)) {
            this.removeRecentlyViewed(entityType, id);
          }
        }
      }
    });
  },
  afterModel(model){
    this.get('entityCache').clearReturnToModel();
    this.addRecentlyViewed(model);
  },
  removeRecentlyViewed(type, id){
    const storage = this.get('storage');

    let oldRecentlyViewedRecords = storage.get('recentlyViewedRecords');
    if(isBlank(oldRecentlyViewedRecords)){
      oldRecentlyViewedRecords = [];
    }

    let newRecentlyViewedRecords = [];
    let index = 1;
    for(let oldRecentlyViewedRecord of oldRecentlyViewedRecords){
      if(!(oldRecentlyViewedRecord.id === id && oldRecentlyViewedRecord.type === type)){
        newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
        index++;

        if(index >= 10) {
          break;
        }
      }
    }

    storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
  },
  addRecentlyViewed(model){
    const storage = this.get('storage');

    let newRecentlyViewedRecord = {
      type: getModelName(model),
      name: model.get('name'),
      id: model.get('id')
    };

    let oldRecentlyViewedRecords = storage.get('recentlyViewedRecords');
    if(isBlank(oldRecentlyViewedRecords)){
      oldRecentlyViewedRecords = [];
    }

    let newRecentlyViewedRecords = [];
    newRecentlyViewedRecords.push(newRecentlyViewedRecord);

    let index = 1;
    for(let oldRecentlyViewedRecord of oldRecentlyViewedRecords){
      if(!(oldRecentlyViewedRecord.id === newRecentlyViewedRecord.id && oldRecentlyViewedRecord.type === newRecentlyViewedRecord.type)){
        newRecentlyViewedRecords.push(oldRecentlyViewedRecord);
        index++;

        if(index >= 10) {
          break;
        }
      }
    }

    storage.set('recentlyViewedRecords', newRecentlyViewedRecords);
  }
});
