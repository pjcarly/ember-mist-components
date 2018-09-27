import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default Component.extend({
  store: service(),
  session: service(),
  config: computed(function(){
    return getOwner(this).resolveRegistration('config:environment');
  }),
  apiEndpoint: computed(function(){
    const config = this.get('config');
    return config.apiEndpoint;
  }),
  showModal(){
    this.$('.modal').modal('show');
    this.get('fetchTemplates').perform();
  },
  triggerDownload: task(function * (){
    if(this.get('session.isAuthenticated')) {
      let headers = new Headers();

      // Lets find the token to send with the request
      const { access_token } = this.get('session.data.authenticated');
      if(!isBlank(access_token)){
        headers.append('Authorization', `Bearer ${access_token}`);
      }

      let anchor = document.createElement("a");

      yield fetch(`${this.get('apiEndpoint')}template/pdf-generate/${this.get('value')}?id=${this.get('model.id')}${!isBlank(this.get('language')) ? `&lang=${this.get('language')}` : ''}`, { headers })
      .then(response => response.blob())
      .then(blobby => {
          let objectUrl = window.URL.createObjectURL(blobby);

          anchor.href = objectUrl;
          anchor.download = `${this.get('model.name')}.pdf`;
          anchor.click();

          window.URL.revokeObjectURL(objectUrl);
      });

      anchor.remove();
    }
  }).drop(),
  fetchTemplates: task(function * (){
    const grouping = this.get('grouping');

    let pdfResults = [];
    yield this.get('store').query('pdf', {
      filter: {
        1: {
          field: 'grouping',
          value: grouping
        }
      }
    }).then((results) => {
      pdfResults = results;
    });

    let selectOptions = [];
    let value = null;
    pdfResults.forEach((pdfResult) => {
      if(isBlank(value)){
        value = pdfResult.get('key');
      }
      let selectOption = {};
      selectOption.value = pdfResult.get('key');
      selectOption.label = pdfResult.get('name');
      selectOptions.push(selectOption);
    });

    this.set('value', value);
    this.set('selectOptions', selectOptions);
  }),
  actions: {
    showModal() {
      this.showModal();
      this.set('modalVisible', true);
    },
    closeModal(){
      this.$('.modal').modal('hide');
      this.set('modalVisible', false);
    },
    templateValueChanged(value){
      this.set('value', value);
    },
    generatePdf(){
      this.get('triggerDownload').perform();
    }
  }
});
