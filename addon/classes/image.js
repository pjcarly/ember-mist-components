import Ember from 'ember';

export function getSecureUrl(model, field, sessionService, style){
  const accessToken = sessionService.get('data.authenticated.access_token');
  const value = model.get(field);
  let url = value.url;
  if(!Ember.isBlank(url)) {
    let params = {};

    if (!Ember.isBlank(accessToken)) {
      params['access_token'] = accessToken;
    }

    if(!Ember.isBlank(style)) {
      params['style'] = style;
    }

    params = Ember.$.param(params);

    if(!Ember.isBlank(params)){
      url = `${url}?${params}`;
    }
  }

  return url;
}
