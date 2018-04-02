import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;
const { inject } = Ember;
const { getOwner } = Ember;
const { service } = inject;

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
      let authHeader;

      yield this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
        headers.append('Authorization', headerValue);
      });

      let anchor = document.createElement("a");

      yield fetch(`${this.get('apiEndpoint')}template/pdf-generate/${this.get('value')}?id=${this.get('model.id')}&development=1`, { headers })
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
        grouping: grouping
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
