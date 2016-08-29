import Ember from 'ember';
import Table from 'ember-light-table';
import ModelUtils from 'ember-field-components/classes/model-utils';
import StringUtils from 'ember-field-components/classes/string-utils';
import { task, timeout } from 'ember-concurrency';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  entityRouter: Ember.inject.service(),

  page: 1,
  limit: 10,
  dir: 'asc',
  sort: null,
  table: null,
  displayHead: true,

  lastPage: 0,
  resultRowFirst: 0,
  resultRowLast: 0,
  resultTotalCount: 0,

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.get('fetchRecords').perform();
  },

  columns: Ember.computed('modelType', function(){
    // This function gets the columns defined on the model, and sets them as the columns of the table
    let type = ModelUtils.getModelType(this.get('modelType'), this.get('store'));
    let modelColumns = ModelUtils.getDefaultListViewColumns(type);
    let columns = [];

    modelColumns.forEach(function(modelColumn){
      let label = ModelUtils.getLabel(type, modelColumn);
      let column = {};
      column['label'] = label;
      column['valuePath'] = modelColumn;
      column['resizable'] = true;
      column['cellComponent'] = 'mist-model-table-cell';
      columns.push(column);
    });

    return columns;
  }),
  queryParams: Ember.computed('page', 'limit', 'sort', 'dir', 'filter', function(){
    let queryParams = this.getProperties(['page', 'limit', 'sort', 'dir', 'filter']);

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    delete queryParams.dir;

    return queryParams;
  }),

  fetchRecords: task(function * (){
    let queryParams = this.get('queryParams');
    let modelType = this.get('modelType');
    yield this.get('store').query(modelType, queryParams).then(records => {
      this.table.setRows(records);
      let meta = records.get('meta');
      this.set('page', meta['page-current']);
      this.set('lastPage', meta['page-count']);
      this.set('resultRowFirst', meta['result-row-first']);
      this.set('resultRowLast', meta['result-row-last']);
      this.set('resultTotalCount', meta['total-count']);
    });
  }).drop(),

  fixed: Ember.computed('height', function(){
    // when a height of the table is passed, we set the column headers fixed
    return Ember.isBlank('height');
  }),

  actions: {
    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          dir: column.ascending ? 'asc' : 'desc',
          sort: Ember.String.dasherize(column.get('valuePath')),
          page: 1
        });
        this.get('fetchRecords').perform();
      }
    },
    onRowClick(row){
      if(Ember.isBlank(this.get('onRowClick'))) {
        this.get('entityRouter').transitionToView(row.get('content'));
      }
      else {
        this.sendAction('onRowClick', row);
      }
    },
    onRowMouseEnter(row) {
      this.sendAction('onRowMouseEnter', row);
    },
    onRowMouseLeave(row) {
      this.sendAction('onRowMouseLeave', row);
    },
    refresh(){
      this.get('fetchRecords').perform();
    },
    nextPage(){
      const lastPage = this.get('lastPage');
      const page = this.get('page');

      if(page < lastPage){
        this.incrementProperty('page');
        this.get('fetchRecords').perform();
      }
    },
    prevPage(){
      const page = this.get('page');

      if(page > 1){
        this.decrementProperty('page');
        this.get('fetchRecords').perform();
      }
    },
    pageSelected(page){
      this.set('page', page);
      this.get('fetchRecords').perform();
    },
    limitChanged(limit){
      this.set('page', 1);
      this.set('limit', limit);
      this.get('fetchRecords').perform();
    }
  }
});
