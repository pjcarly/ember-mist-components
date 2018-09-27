import Component from '@ember/component';
import { task, taskGroup } from 'ember-concurrency';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default Component.extend({
  tagName: '',
  storage: service(),
  ajax: service(),
  addressLoading: taskGroup(),

  config: computed(function(){
    return getOwner(this).resolveRegistration('config:environment');
  }),

  shouldCache: computed(function(){
    const config = this.get('config');
    if(config.hasOwnProperty('ember-mist-components') && config['ember-mist-components'].hasOwnProperty('cacheFields')) {
      return config['ember-mist-components'].cacheFields;
    }
    return true;
  }),

  apiEndpoint: computed(function(){
    const config = this.get('config');
    return config.apiEndpoint;
  }),

  didReceiveAttrs(){
    this._super(...arguments);
    this.get('setCountrySelectOptions').perform();
  },

  setCountrySelectOptions: task(function * (){
    const { storage, ajax, shouldCache } = this.getProperties('storage', 'ajax', 'shouldCache');
    let cachedCountrySelectOptions = storage.get('addressCountrySelectOptions');

    if(isBlank(cachedCountrySelectOptions) || !shouldCache){
      yield ajax.request(this.get('apiEndpoint') + 'address/address/countries/selectoptions').then((response) => {
        if(!isBlank(response)){
          if(shouldCache) {
            storage.set('addressCountrySelectOptions', response);
          }
          this.set('countrySelectOptions', response);
        }
      });
    } else {
      this.set('countrySelectOptions', cachedCountrySelectOptions);
    }
  }).group('addressLoading')
});
