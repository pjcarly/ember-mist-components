import Ember from 'ember';
import { getModelType, getDefaultIncludes } from 'ember-field-components/classes/model-utils';
import { removeRecentlyViewed } from 'ember-mist-components/classes/recently-viewed';

const { Mixin } = Ember;
const { isBlank } = Ember;

export default Mixin.create({
  model(params) {
    const entityName = this.get('entityName');
    const type = getModelType(entityName, this.get('store'));
    const modelDefaultIncludes = getDefaultIncludes(type);
    const routeDefaultIncludes = this.get('defaultIncludes');

    // Lets merge the different includes
    let includes = [];
    if(!isBlank(modelDefaultIncludes) && modelDefaultIncludes.length > 0) {
      includes = includes.concat(modelDefaultIncludes);
    }

    if(!isBlank(routeDefaultIncludes) && routeDefaultIncludes.length > 0) {
      includes = includes.concat(routeDefaultIncludes);
    }

    // and filter the doubles
    let uniqueIncludes = includes.filter((elem, index, self) => {
      return index == self.indexOf(elem);
    })

    // And now construct the options hash
    let options = {};
    if(uniqueIncludes.length > 0) {
      options['include'] = uniqueIncludes.join(',');
    }

    return this.store.findRecord(entityName, params[`${entityName}_id`], options);
  },
  actions: {
    error(error, transition){
      const entityType = this.get('entityName');
      if(!isBlank(entityType)) {
        const idParam = `${entityType}_id`;
        const routeName = transition.targetName;

        if(!isBlank(idParam) && transition.params.hasOwnProperty(routeName) && transition.params[routeName].hasOwnProperty(idParam)) {
          const id = transition.params[routeName][idParam];
          if(!isBlank(id)) {
            removeRecentlyViewed(entityType, id, this.get('storage'));
          }
        }
      }
      return true;
    }
  }
});
