import Ember from 'ember';
import Table from 'ember-light-table';
import QueryParams from '../../classes/query-params';
import ModelUtils from 'ember-field-components/classes/model-utils';
import StringUtils from 'ember-field-components/classes/string-utils';
import { task, timeout } from 'ember-concurrency';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  entityRouter: Ember.inject.service(),

  table: null,
  displayHead: true,

  lastPage: 0,
  resultRowFirst: 0,
  resultRowLast: 0,
  resultTotalCount: 0,

  models: null,

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.get('fetchRecords').perform();
  },

  filters: Ember.computed({
    get(key){
      return this.get('queryParams.filter');
    },
    set(key, value){
      this.set('queryParams.filter', value);
      return this.get('queryParams.filter');
    }
  }),

  queryParams: Ember.computed(function(){
    let queryParams = this.get('_queryParams');
    if(Ember.isBlank(queryParams)){
      this.set('_queryParams', QueryParams.create());
    }
    return this.get('_queryParams');
  }),

  guid: Ember.computed(function(){
    return Ember.guidFor(this);
  }),

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
      column['width'] = (modelColumn === 'id') ? '60px' : undefined;
      column['resizable'] = (modelColumn !== 'id');
      column['cellComponent'] = 'mist-model-table-cell';

      columns.push(column);
    });

    return columns;
  }),

  fetchRecords: task(function * (){
    let modelType = this.get('modelType');
    yield this.get('store').query(modelType, this.get('queryParams.params')).then(records => {
      this.table.setRows(records);
      this.set('models', records);
      let meta = records.get('meta');
      this.set('queryParams.page', Ember.isBlank(meta['page-current']) ? 1 : meta['page-current']);
      this.set('lastPage', Ember.isBlank(meta['page-count']) ? 1 : meta['page-count']);
      this.set('resultRowFirst', Ember.isBlank(meta['result-row-first']) ? 0 : meta['result-row-first']);
      this.set('resultRowLast', Ember.isBlank(meta['result-row-last']) ? 0 : meta['result-row-last']);
      this.set('resultTotalCount', Ember.isBlank(meta['total-count']) ? 0 : meta['total-count']);
    });
  }).drop(),

  fixed: Ember.computed('tableHeight', function(){
    // when a height of the table is passed, we set the column headers fixed
    return !Ember.isBlank(this.get('tableHeight'));
  }),

  actions: {
    onColumnClick(column) {
      if (column.sorted) {
        this.set('queryParams.dir', column.ascending ? 'asc' : 'desc');
        this.set('queryParams.sort', Ember.String.dasherize(column.get('valuePath')));
        this.set('queryParams.page', 1);
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
      if(this.get('updateMarkersOnRowHover')) {
        let location = row.get('content').getLocation('location');
        if(!Ember.isBlank(location)){
          let marker = location.getMarker('company-map');
          if(!Ember.isBlank(marker)){
            marker.setIcon('assets/images/map-marker-red.png');
          }
        }
      }
    },
    onRowMouseLeave(row) {
      if(this.get('updateMarkersOnRowHover')){
        let location = row.get('content').getLocation('location');
        if(!Ember.isBlank(location)){
          let marker = location.getMarker('company-map');
          if(!Ember.isBlank(marker)){
            marker.setIcon('assets/images/map-marker-purple.png');
          }
        }
      }
    },
    refresh(){
      this.get('fetchRecords').perform();
    },
    nextPage(){
      const queryParams = this.get('queryParams');
      const lastPage = this.get('lastPage');

      if(queryParams.get('page') < lastPage){
        queryParams.nextPage();
        this.get('fetchRecords').perform();
      }
    },
    prevPage(){
      const queryParams = this.get('queryParams');

      if(queryParams.get('page') > 1){
        queryParams.prevPage();
        this.get('fetchRecords').perform();
      }
    },
    pageSelected(page){
      this.set('queryParams.page', page);
      this.get('fetchRecords').perform();
    },
    limitChanged(limit){
      this.set('queryParams.page', 1);
      this.set('queryParams.limit', limit);
      this.get('fetchRecords').perform();
    }
  }
});
