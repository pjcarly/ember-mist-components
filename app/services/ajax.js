import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { computed } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { getOwner } = Ember;
const { service } = inject;

export default AjaxService.extend({
  session: service(),
  host: computed(function(){
    let config = getOwner(this).resolveRegistration('config:environment');
    return config.apiHost;
  }),
  endpoint: computed(function(){
    let config = getOwner(this).resolveRegistration('config:environment');
    return config.apiEndpoint;
  }),
  headers: computed('session.data.authenticated.access_token', function(){
    const headers = {};
    const { access_token } = this.get('session.data.authenticated');

    if(!isBlank(access_token)){
      headers['Authorization'] = `Bearer ${access_token}`;
    }

    return headers;
  })
});
