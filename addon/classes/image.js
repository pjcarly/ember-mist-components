import Ember from 'ember';

const { isBlank, $ } = Ember;

export function getSecureUrl(model, field, sessionService, style){
  const accessToken = sessionService.get('data.authenticated.access_token');
  const value = model.get(field);
  let url = value.url;
  if(!isBlank(url)) {
    let params = {};

    if (!isBlank(accessToken)) {
      params['access_token'] = accessToken;
    }

    if(!isBlank(style)) {
      params['style'] = style;
    }

    params = $.param(params);

    if(!isBlank(params)){
      url = `${url}?${params}`;
    }
  }

  return url;
}
