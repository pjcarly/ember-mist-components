import Ember from 'ember';

const { isBlank } = Ember;
const { $ } = Ember;

export function getSecureUrl(model, field, style){
  const value = model.get(field);

  if(!isBlank(value) && !isBlank(value.url)) {
    if(isBlank(style)) {
      return value.url;
    } else {
      if(value.url.includes('?')) {
        return `${value.url}&style=${style}`;
      } else {
        return `${value.url}?style=${style}`;
      }
    }
  }
}
