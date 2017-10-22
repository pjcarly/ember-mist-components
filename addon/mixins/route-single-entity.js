import Ember from 'ember';
import { getModelType, getDefaultIncludes } from 'ember-field-components/classes/model-utils';

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
  }
});
