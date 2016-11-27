import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';

export default Ember.Component.extend(FieldOutputComponent, {
  session: Ember.inject.service(),
  imageUrl: Ember.computed('style', 'value', 'value.url', 'session.data', 'session.data.authenticated', 'session.data.authenticated.access_token', function(){
    const accessToken = this.get('session.data.authenticated.access_token');
    const style = this.get('style');
    let url = this.get('value.url');
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
  }),
  actions: {
    clickImage(){
      if(this.get('clickImage')){
        this.get('clickImage')();
      }
    }
  }
});
