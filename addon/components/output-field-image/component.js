import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import ImageUtilities from 'ember-mist-components/classes/image';

export default Ember.Component.extend(FieldOutputComponent, {
  session: Ember.inject.service(),
  imageUrl: Ember.computed('style', 'value', 'value.url', 'session.data', 'session.data.authenticated', 'session.data.authenticated.access_token', function(){
    return ImageUtilities.getSecureUrl(this.get('model'), this.get('field'), this.get('session'), this.get('style'));
  }),
  actions: {
    clickImage(){
      if(this.get('clickImage')){
        this.get('clickImage')();
      }
    }
  }
});
