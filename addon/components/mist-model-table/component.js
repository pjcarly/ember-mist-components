import Ember from 'ember';
import Table from 'ember-light-table';
import ModelUtils from 'ember-field-components/classes/model-utils';
import StringUtils from 'ember-field-components/classes/string-utils';

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
  field: null,
  parent: null,
  filter: null,
  parentField: 'parent',
  displayHead: true,
  searchString: null,

  columns: Ember.computed('modelType', function(){
    let type = ModelUtils.getModelType(this.get('modelType'), this.get('store'));
    let modelColumns = ModelUtils.getDefaultListViewColumns(type);
    let columns = [];

    modelColumns.forEach(function(modelColumn){
      let label = ModelUtils.getLabel(type, modelColumn);
      let column = {};
      column['label'] = label;
      column['valuePath'] = modelColumn;
      column['cellComponent'] = 'mist-model-table-cell';
      columns.push(column);
    });

    return columns;
  }),

  init() {
    this._super(...arguments);

    let field = this.get('field');
    let models = [];

    if(Ember.isBlank(field))
    {
      models = this.get('models');
    }
    else
    {
      let parent = this.get('parent');
      let modelType = ModelUtils.getChildModelTypeName(parent, field);
      let filter = { fields: {}};
      let parentField = ModelUtils.getRelationshipInverse(parent, field);

      filter.fields[parentField] = parent.get('id');
      this.set('filter', filter);
      this.set('modelType', modelType);
      this.fetchRecords();
    }

    this.set('table', new Table(this.get('columns'), models));
  },

  fetchRecords() {
    this.set('isLoading', true);
    this._buildSearchStringQuery();

    let queryParams = this.getProperties(['page', 'limit', 'sort', 'dir', 'filter']);

    if(queryParams.dir === 'desc'){
      queryParams.sort = '-' + queryParams.sort;
    }
    delete queryParams.dir;

    this.get('store').query(this.get('modelType'), queryParams).then(records => {
      this.table.addRows(records);
      if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
        this.set('isLoading', false);
      }
    });
  },

  _buildSearchStringQuery(){
    // Here we check for a search string present, and build it if found
    let searchString = this.get('searchString');
    let nameColumn = Ember.String.dasherize(ModelUtils.getNameColumn(this.get('modelType')));
    let filters = this.get('filter');

    if(Ember.isBlank(filters)){
      filters = { fields: {}};
    }

    if(!Ember.isBlank(searchString)) {
      filters.fields[nameColumn] = {};
      filters.fields[nameColumn]['operator'] = 'LIKE';
      filters.fields[nameColumn]['value'] = StringUtils.replaceAll(searchString, '*', '%');
    } else {
      delete filters.fields[nameColumn];
    }

    if(Object.keys(filters).length == 0){
      filters = null;
    }

    this.set('filter', filters);
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
          sort: Ember.String.dasherize(column.get('valuePath')),
          page: 1
        });
        this.table.setRows([]);
        this.fetchRecords();
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
    }
  }
});
