import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { computed, inject, getOwner } = Ember;
const { service } = inject;

export default AjaxService.extend({
  session: service(),
  host: computed(function(){
    let config = getOwner(this).resolveRegistration('config:environment');
    return config.apiHost;
  }),
  headers: computed(function(){
    // TODO: there might be an issue here, headers is a computed property, meaning it will only return a different value
    // when the properties it 'observes' changes, however, we aren't observing any properties here, as the authorizer
    // doesn't have a Authorization property to observe, the session service takes care of that.
    // When the Authorization header changes (because of a token refresh), this property will not be called, and will still return
    // the old auth header, resulting in an Access Denied
    // Investigate if this can be resolved using the Ember Evented events the session service triggers (authenticationSucceeded)
    let headers = {};
    let authHeader;

    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      authHeader = headerValue;
    });

    headers['Authorization'] = authHeader;

    return headers;
  })
});
