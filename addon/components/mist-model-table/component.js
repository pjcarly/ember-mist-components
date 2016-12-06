import Ember from 'ember';
import Table from 'ember-light-table';
import QueryParams from '../../classes/query-params';
import ModelUtils from 'ember-field-components/classes/model-utils';
import StringUtils from 'ember-field-components/classes/string-utils';
import { task } from 'ember-concurrency';
import { EKMixin, keyUp, keyDown } from 'ember-keyboard';

const { dasherize } = Ember.String;

export default Ember.Component.extend(EKMixin, {
  store: Ember.inject.service(),
  entityRouter: Ember.inject.service(),
  classNames: ['mist-model-table'],
  classNameBindings: ['displaySelected', 'fixedSearch'],

  table: null,
  fixedSearch: false,

  lastPage: 0,
  resultRowFirst: 0,
  resultRowLast: 0,
  resultTotalCount: 0,

  selectedModels: [],

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.get('fetchRecords').perform();
    if(this.get('fixedSearch')){
      this.set('searchToggled', true);
    }
  },
  didInsertElement(){
    this._super(...arguments);
    if(this.get('fixedSearch')){
      this.$('input[type="search"]').focus();
    }
  },

  keyboardFind: Ember.on(keyUp('KeyF'), function(){
    if(!this.get('searchToggled')){
      this.toggleSearch();
      this.$('input[type="search"]').focus();
    } else if(this.get('fixedSearch')) {
      this.$('input[type="search"]').focus();
    }
  }),
  keyboardRefresh: Ember.on(keyUp('KeyR'), function(){
    this.get('fetchRecords').perform();
  }),
  keyboardNext: Ember.on(keyUp('ArrowRight'), function(){
    this.nextPage();
  }),
  keyboardPrev: Ember.on(keyUp('ArrowLeft'), function(){
    this.prevPage();
  }),
  keyboardDown: Ember.on(keyDown('ArrowDown'), function(event){
    event.preventDefault();
    this.nextRow();
  }),
  keyboardUp: Ember.on(keyDown('ArrowUp'), function(event){
    event.preventDefault();
    this.prevRow();
  }),
  keyboardEnter: Ember.on(keyDown('Enter'), function(){
    // this only has meaning when the table isn't multiSelect
    if(!this.get('multiSelect')){
      const activeRows = this.get('table.rows').filterBy('activated');
      if(activeRows.length > 0){
        this.rowSelected(activeRows[0]);
      }
    }
  }),
  keyboardSpace: Ember.on(keyDown('Space'), function(){
    // this only has meaning when the table is multiSelect
    if(this.get('multiSelect')){
      const activeRows = this.get('table.rows').filterBy('activated');
      if(activeRows.length > 0){
        this.rowSelected(activeRows[0]);
      }
    }
  }),

  filters: Ember.computed({
    get(){
      return this.get('queryParams.filter');
    },
    set(key, value){
      this.set('queryParams.standardFilter', value);
      return this.get('queryParams.standardFilter');
    }
  }),
  amountSelected: Ember.computed('selectedModels.[]', function(){
    return this.get('selectedModels.length');
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

    if(this.get('multiSelect')){
      let column = {};
      column['label'] = '';
      column['width'] = '60px';
      column['resizable'] = false;
      column['cellComponent'] = 'mist-model-table-selector';
      column['cellClassNames'] = 'selector';
      column['component'] = 'mist-model-table-all-selector';
      column['classNames'] = 'selector';
      column['selectAll'] = true;
      columns.push(column);
    }

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
  isArrayTable: Ember.computed('models', function(){
    return this.get('arrayTable');
  }),
  fixed: Ember.computed('tableHeight', function(){
    // when a height of the table is passed, we set the column headers fixed
    return !Ember.isBlank(this.get('tableHeight'));
  }),

  fetchRecords: task(function * (){
    let modelType = this.get('modelType');
    if(this.get('isArrayTable') || this.get('displaySelected')){
      // this table is an array table, we don't query the store for records
      let models = this.get('displaySelected') ? this.get('selectedModels') : this.get('models');
      let records = [];

      let queryParams = this.get('queryParams');

      // First we filter by Search keyword
      if(!Ember.isBlank(queryParams.search)){
        models = models.filter((model) => {
          const modelValueToCompare = model.get(Ember.String.camelize(queryParams.get('searchField')));
          return !Ember.isBlank(modelValueToCompare) && StringUtils.wildcardMatch(modelValueToCompare.toUpperCase(), queryParams.search.toUpperCase());
        });
      }

      // Next we sort
      if(!Ember.isBlank(queryParams.sort)){
        const sortBy = Ember.String.camelize(queryParams.sort);
        models = models.sortBy(sortBy);
        if(queryParams.dir === 'desc'){
          models = models.reverse();
        }
      }

      // then we page and limit
      models.forEach((model, index) => {
        if((index+1 <= queryParams.limit * queryParams.page) && (index+1 > queryParams.limit * (queryParams.page-1))) {
          records.push(model);
        }
      });

      // finally we set helper variables
      this.set('lastPage', Math.ceil(models.get('length')/queryParams.limit));
      this.set('resultRowFirst', parseInt(((queryParams.page-1) * queryParams.limit) +1));
      this.set('resultRowLast', parseInt(models.get('length') < queryParams.limit ? (((queryParams.page-1) * queryParams.limit) + models.get('length')) : (queryParams.page * queryParams.limit)));
      this.set('resultTotalCount', models.get('length'));

      this.table.setRows(records);
      this.set('mapModels', records);
      this.reSetSelected();
    } else {
      // we query the records from the store instead
      this.setDefaultIncludes();
      let queryParams = this.get('queryParams.params');
      yield this.get('store').query(modelType, queryParams).then(records => {
        this.table.setRows(records);
        this.set('mapModels', records);
        let meta = records.get('meta');
        this.set('queryParams.page', Ember.isBlank(meta['page-current']) ? 1 : meta['page-current']);
        this.set('lastPage', Ember.isBlank(meta['page-count']) ? 1 : meta['page-count']);
        this.set('resultRowFirst', Ember.isBlank(meta['result-row-first']) ? 0 : meta['result-row-first']);
        this.set('resultRowLast', Ember.isBlank(meta['result-row-last']) ? 0 : meta['result-row-last']);
        this.set('resultTotalCount', Ember.isBlank(meta['total-count']) ? 0 : meta['total-count']);
        this.reSetSelected();
      });
    }

    this.set('ranOnceAtLeast', true);
  }).drop(),

  setDefaultIncludes(queryParams){
    // This method adds the default includes defined on the modeltype, to the queryParams object
    let type = ModelUtils.getModelType(this.get('modelType'), this.get('store'));
    let defaultIncludes = ModelUtils.getDefaultIncludes(type);
    this.set('queryParams.include', defaultIncludes.join(','));
  },

  toggleSearch(){
    if(!this.get('fixedSearch')){
      this.toggleProperty('searchToggled');
      if(this.get('searchToggled')){
        this.$('input[type="search"]').focus();
      } else {
        // when we toggle the search, and there is a search value filled in, we clear the value and refresh the records
        this.set('queryParams.search', '');
        this.get('fetchRecords').perform();
      }
    }
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
  nextRow(){
    let rows = this.get('table.rows');
    let activatedIndex;
    rows.forEach((row, index) => {
      if(row.get('activated')){
        activatedIndex = index;
      }
    });

    if(Ember.isBlank(activatedIndex)){
      rows[0].set('activated', true);
      this.rowActivateMapMarker(rows[0]);
    } else if(activatedIndex+1 < rows.length){
      rows.setEach('activated', false);
      rows[activatedIndex+1].set('activated', true);
      this.rowActivateMapMarker(rows[activatedIndex+1]);
    }
  },
  prevRow(){
    let rows = this.get('table.rows');
    let activatedIndex;
    rows.forEach((row, index) => {
      if(row.get('activated')){
        activatedIndex = index;
      }
    });

    if(Ember.isBlank(activatedIndex)){
      rows[0].set('activated', true);
      this.rowActivateMapMarker(rows[0]);
    } else if(activatedIndex > 0){
      rows.setEach('activated', false);
      rows[activatedIndex-1].set('activated', true);
      this.rowActivateMapMarker(rows[activatedIndex-1]);
    }
  },
  reSetSelected(){
    if(this.get('multiSelect')){
      // this function makes sure, that when we change limits, pages, refresh, ...
      // we set the selected attribute to the correct rows
      let selectedModels = this.get('selectedModels');
      this.get('table.rows').forEach((row) => {
        const model = row.get('content');
        row.set('rowSelected', selectedModels.includes(model));
      });

      this.setSelectAllColumn();
    }
  },
  setSelectAllColumn(){
    let selectAllColumn = this.table.columns.get('firstObject');
    selectAllColumn.set('valuePath', this.get('table.rows').isEvery('rowSelected', true));

    if(this.get('selectedModels.length') === 0 && this.get('displaySelected')){
      this.toggleProperty('displaySelected');
      this.get('fetchRecords').perform();
    }
  },
  rowSelected(selectedRow){
    if(Ember.isBlank(this.get('onRowSelected'))){
      if(this.get('multiSelect')){
        selectedRow.toggleProperty('rowSelected');

        let selectedModels = this.get('selectedModels');
        const model = selectedRow.get('content');
        if(selectedRow.get('rowSelected')){
          if(!selectedModels.includes(model)){
            // model not yet in the array, so we add it
            selectedModels.pushObject(model);
          }
        } else {
          if(selectedModels.includes(model)){
            // model in the array, while it shouldn't be, remove it
            selectedModels.removeObject(model);
          }
        }

        if(this.get('displaySelected')){
          this.get('fetchRecords').perform();
        } else {
          this.setSelectAllColumn();
        }
      } else {
        this.get('entityRouter').transitionToView(selectedRow.get('content'));
      }
    } else {
      this.sendAction('onRowSelected', selectedRow);
    }
  },
  rowActivateMapMarker(rowToActivate){
    if(this.get('updateMarkersOnRowHover')) {
      this.get('table.rows').forEach((row) => {
        if(row !== rowToActivate){
          this.rowDeactivateMapMarker(row);
        }
      });

      let location = rowToActivate.get('content').getLocation('location');

      if(!Ember.isBlank(location)){
        let marker = location.getMarker('company-map');
        if(!Ember.isBlank(marker)){
          marker.setIcon('assets/images/map-marker-red.png');
        }
      }


    }
  },
  rowDeactivateMapMarker(row){
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
  deactivateRows(){
    this.get('table.rows').setEach('activated', false);
  },

  actions: {
    onColumnClick(column) {
      if(this.get('multiSelect') && column.get('selectAll')){
        column.set('sorted', false);
        column.toggleProperty('valuePath');

        let selectedModels = this.get('selectedModels');
        this.get('table.rows').forEach((row) => {
          row.set('rowSelected', column.get('valuePath'));
          const model = row.get('content');
          if(row.get('rowSelected')){
            if(!selectedModels.includes(model)){
              // model not yet in the array, so we add it
              selectedModels.pushObject(model);
            }
          } else {
            if(selectedModels.includes(model)){
              // model in the array, while it shouldn't be, remove it
              selectedModels.removeObject(model);
            }
          }
        });

      } else if (column.sorted) {
        this.set('queryParams.dir', column.ascending ? 'asc' : 'desc');
        this.set('queryParams.sort', dasherize(column.get('valuePath')));
        this.set('queryParams.page', 1);
        this.get('fetchRecords').perform();
      }
    },
    onRowClick(row){
      this.rowSelected(row);
    },
    onRowMouseEnter(row) {
      this.rowActivateMapMarker(row);
      this.deactivateRows();
    },
    onRowMouseLeave(row) {
      this.rowDeactivateMapMarker(row);
      this.deactivateRows();
    },
    refresh(){
      this.get('fetchRecords').perform();
    },
    nextPage(){
      this.nextPage();
    },
    prevPage(){
      this.prevPage();
    },
    pageSelected(page){
      this.set('queryParams.page', page);
      this.get('fetchRecords').perform();
    },
    limitChanged(limit){
      this.set('queryParams.page', 1);
      this.set('queryParams.limit', limit);
      this.get('fetchRecords').perform();
    },
    toggleSearch(){
      this.toggleSearch();
    },
    searchValueChanged(value){
      this.set('queryParams.page', 1);
      this.set('queryParams.search', value);
    },
    search(){
      if(this.get('searchToggled')){
        this.get('fetchRecords').perform();
      } else {
        this.toggleSearch();
      }
    },
    toggleDisplaySelected(){
      this.set('queryParams.page', 1);
      this.toggleProperty('displaySelected');
      this.get('fetchRecords').perform();
    }
  }
});
