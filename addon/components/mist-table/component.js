import Ember from 'ember';
import Table from 'ember-light-table';
import ModelUtils from 'ember-field-components/classes/model-utils';

export default Ember.Component.extend({
  classNames: ['table-responsive'],
  store: Ember.inject.service(),
  entityRouter: Ember.inject.service(),
  page: 1,
  limit: 20,
  dir: 'asc',
  sort: null,
  table: null,
  isLoading: false,
  models: [],
  modelType: null,

  columns: Ember.computed('modelType', function(){
    let type = ModelUtils.getModelType(this.get('modelType'), this.get('store'));
    let modelColumns = ModelUtils.getDefaultListViewColumns(type);
    let columns = [];

    modelColumns.forEach(function(modelColumn){
      let label = ModelUtils.getLabel(type, modelColumn);
      let column = {};
      column['label'] = label;
      column['valuePath'] = modelColumn;
      columns.push(column);
    });

    return columns;
  }),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns'), this.get('models')));
  },

  fetchRecords() {
    this.set('isLoading', true);
    let queryParams = this.getProperties(['page', 'limit', 'sort', 'dir']);
    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    delete queryParams.dir;

    this.get('store').query(this.get('modelType'), queryParams).then(records => {
      this.table.addRows(records);
      this.set('isLoading', false);
    });
  },

  actions: {
    onScrolledToBottom() {
      this.incrementProperty('page');
      this.fetchRecords();
    },
    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          dir: column.ascending ? 'asc' : 'desc',
          sort: column.get('valuePath'),
          page: 1
        });
        this.table.setRows([]);
        this.fetchRecords();
      }
    },
    onRowClick(row){
      this.get('entityRouter').transitionToView(row.get('content'));
    }
  }
});
