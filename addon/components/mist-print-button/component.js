/* global window */
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default Component.extend({
  store: service(),
  config: computed(function(){
    return getOwner(this).resolveRegistration('config:environment');
  }),
  apiEndpoint: computed(function(){
    const config = this.get('config');
    return config.apiEndpoint;
  }),
  template: computed('value', function(){
    const store = this.get('store');
    return store.peekRecord('pdf', this.get('value'));
  }),
  showModal(){
    this.$('.modal').modal('show');
    this.get('fetchTemplates').perform();
  },
  generatePdf: task(function * (){
    const template = this.get('template');
    const model = this.get('model');
    let digest = null;

    yield template.generateDigest({ id: model.get('id')})
    .then((results) => {
      digest = results.digest;
    });

    window.open(`${this.get('apiEndpoint')}template/generate/${this.get('template.key')}?id=${this.get('model.id')}&digest=${digest}${!isBlank(this.get('language')) ? `&lang=${this.get('language')}` : ''}`, '_blank');
  }),
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
        value = pdfResult.get('id');
      }

      let selectOption = {};
      selectOption.value = pdfResult.get('id');
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
    }
  }
});
