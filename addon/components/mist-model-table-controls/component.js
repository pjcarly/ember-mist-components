import Ember from 'ember';

const { Component } = Ember;
const { computed } = Ember;
const { isBlank } = Ember;

export default Component.extend({
  classNames: ['row'],
  rowSelectOptions: [{
    'value': '10',
    'label': '10'
  }, {
    'value': '25',
    'label': '25'
  }, {
    'value': '50',
    'label': '50'
  }, {
    'value': '100',
    'label': '100'
  }, {
    'value': '200',
    'label': '200'
  }],
  pageSelectOptions: computed('lastPage', function(){
    const lastPage = this.get('lastPage');
    let selectOptions = [{
      'value': '1',
      'label': '1'
    }];

    if(!isBlank(lastPage)){
      for(let i = 2; i <= lastPage; i++){
        selectOptions.push({
          'value': (i.toString()),
          'label': (i.toString())
        });
      }
    }

    return selectOptions;
  }),
  rowsValue: computed('rows', function(){
    return this.get('rows').toString();
  }),
  actions: {
    nextPage(){
      this.get('nextPage')();
    },
    prevPage(){
      this.get('prevPage')();
    },
    pageSelected(page){
      this.get('pageSelected')(parseInt(page));
    },
    rowsSelected(rows){
      this.get('rowsSelected')(parseInt(rows));
    },
    toggleDisplaySelected(){
      this.get('toggleDisplaySelected')();
    }
  }
});
