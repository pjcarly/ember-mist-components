import Ember from 'ember';
import Table from 'ember-light-table';
import QueryParams from '../../classes/query-params';
import ModelUtils from 'ember-field-components/classes/model-utils';
import StringUtils from 'ember-field-components/classes/utils';
import { task } from 'ember-concurrency';
import { EKMixin, keyUp, keyDown } from 'ember-keyboard';

const { Component, inject, computed, get, on, guidFor, isBlank, String } = Ember;
const { dasherize, capitalize, camelize } = String;
const { service } = inject;

export default Component.extend({
  store: service(),
  storage: service(),
  entityRouter: service(),
  classNames: ['mist-model-table'],
  classNameBindings: ['displaySelected', 'fixedSearch'],

  init() {
    this._super(...arguments);

    this.set('table', null);
    this.set('lastPage', 0);
    this.set('resultRowFirst', 0);
    this.set('resultRowLast', 0);
    this.set('resultTotalCount', 0);
    this.set('selectedModels', []);

    this.setActiveModelType();
    this.set('table', new Table([]));
  },
  didInsertElement(){
    this._super(...arguments);

    this.get('initializeTable').perform();
  },
  initializeTable: task(function * (){
    yield this.get('fetchRecords').perform();

    if(this.get('fixedSearch')){
      this.set('searchToggled', true);
    }

    if(this.get('fixedSearch')){
      this.$('input[type="search"]').focus();
    }
  }),
  setActiveModelType(){
    // This function is needed for Polymorphic cases, where a choice of model type is passed
    if(isBlank(this.get('activeModelType'))){
      if(this.get('isMultipleModelTypes')){
        this.set('activeModelType', this.get('modelType')[0]);
      } else {
        this.set('activeModelType', this.get('modelType'));
      }
    }
  },
  setListViews: task(function * (){
    let activeListView = this.get('activeListView');
    let defaultListViewKey = this.get('defaultListView');
    let savedListViewSelection = this.getSavedListViewSelection();

    if(isBlank(this.get('availableListViews'))){
      let availableListViews = [];
      if(!isBlank(this.get('defaultModelListView'))){
        let availableListView = {};
        availableListView.value = 'All';
        availableListView.label = 'All'
        availableListViews.push(availableListView);
      }

      const grouping = this.get('listViewGrouping');
      if(!isBlank(grouping)) { // Only if a grouping was provided, will we fetch them
        let defaultListView;
        let savedSelectedListView;

        yield this.get('store').query('list-view', {filter: {grouping: grouping}}).then((listViews) => {
          listViews.forEach((listView) => {
            let availableListView = {}
            availableListView.value = listView.get('id');
            availableListView.label = listView.get('name');
            availableListViews.push(availableListView);

            if(listView.get('id') === savedListViewSelection){
              savedSelectedListView = listView;
            }

            if(listView.get('key') === defaultListViewKey){
              defaultListView = listView;
            }
          });
        });

        // Here we check if we have a saved list view selection from a previous page visit
        // In case we have nothing, we also check if there is a default provided
        if(!isBlank(savedSelectedListView)){
          activeListView = savedSelectedListView;
          this.set('activeListViewKey', activeListView.get('id'));
          this.set('activeListView', activeListView);
          this.setQueryParamsBasedOnActiveListView();
        } else if (!isBlank(defaultListView)) {
          activeListView = defaultListView;
          this.set('activeListViewKey', activeListView.get('id'));
          this.set('activeListView', activeListView);
          this.setQueryParamsBasedOnActiveListView();
        }
      }

      this.set('availableListViews', availableListViews);
      this.set('displayListViewSelector', availableListViews.get('length') > 1);
    }

    if(isBlank(activeListView)){
      this.set('activeListViewKey', 'All');
      this.set('activeListView', this.get('defaultModelListView'));
      this.setQueryParamsBasedOnActiveListView();
    }
  }),
  setQueryParamsBasedOnActiveListView(){
    const activeListView = this.get('activeListView');
    const listViewLimit = get(activeListView, 'rows');
    const listViewSort = get(activeListView, 'sort');
    let queryParams = this.get('queryParams');

    queryParams.set('limit', isBlank(listViewLimit) ? 10 : listViewLimit);
    queryParams.set('sort', isBlank(listViewSort) ? '' : dasherize(listViewSort.field));
    queryParams.set('dir', isBlank(listViewSort) ? 'asc' : listViewSort.dir.toLowerCase());
  },
  isMultipleModelTypes: computed('modelType', function(){
    return Array.isArray(this.get('modelType'));
  }),
  multipleModelTypeSelectOptions: computed('modelType', function(){
    const modelTypes = this.get('modelType');
    let selectOptions = [];

    modelTypes.forEach((modelType) => {
      let selectOption = {};
      selectOption.value = modelType;
      selectOption.label = capitalize(modelType);
      selectOptions.push(selectOption);
    });

    return selectOptions;
  }),
  keyboardFind: on(keyUp('KeyF'), function(){
    if(!this.get('searchToggled')){
      this.toggleSearch();
      this.$('input[type="search"]').focus();
    } else if(this.get('fixedSearch')) {
      this.$('input[type="search"]').focus();
    }
  }),
  keyboardRefresh: on(keyUp('KeyR'), function(){
    this.get('fetchRecords').perform();
  }),
  keyboardNext: on(keyUp('ArrowRight'), function(){
    this.nextPage();
  }),
  keyboardPrev: on(keyUp('ArrowLeft'), function(){
    this.prevPage();
  }),
  keyboardDown: on(keyDown('ArrowDown'), function(event){
    event.preventDefault();
    this.nextRow();
  }),
  keyboardUp: on(keyDown('ArrowUp'), function(event){
    event.preventDefault();
    this.prevRow();
  }),
  keyboardEnter: on(keyDown('Enter'), function(){
    // this only has meaning when the table isn't multiSelect
    if(!this.get('multiSelect')){
      const activeRows = this.get('table.rows').filterBy('activated');
      if(activeRows.length > 0){
        this.rowSelected(activeRows[0]);
      }
    }
  }),
  keyboardSpace: on(keyDown('Space'), function(){
    // this only has meaning when the table is multiSelect
    if(this.get('multiSelect')){
      const activeRows = this.get('table.rows').filterBy('activated');
      if(activeRows.length > 0){
        this.rowSelected(activeRows[0]);
      }
    }
  }),

  filters: computed({
    get(){
      return this.get('queryParams.filter');
    },
    set(key, value){
      this.set('queryParams.standardFilter', value);
      return this.get('queryParams.standardFilter');
    }
  }),
  amountSelected: computed('selectedModels.[]', function(){
    return this.get('selectedModels.length');
  }),
  queryParams: computed(function(){
    let queryParams = this.get('_queryParams');
    if(isBlank(queryParams)){
      this.set('_queryParams', QueryParams.create());
    }
    return this.get('_queryParams');
  }),
  guid: computed(function(){
    return guidFor(this);
  }),
  defaultModelListView: computed('activeModelType', function(){
    let type = ModelUtils.getModelType(this.get('activeModelType'), this.get('store'));
    const modelListView = this.get('modelListView');
    return ModelUtils.getModelListView(type, modelListView);
  }),
  columns: computed('activeModelType', 'activeListView', function(){
    // This function gets the columns defined on the model, and sets them as the columns of the table
    const type = ModelUtils.getModelType(this.get('activeModelType'), this.get('store'));
    const activeListView = this.get('activeListView');
    const queryParams = this.get('queryParams');
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

    get(activeListView, 'columns').forEach((modelColumn) => {
      const camelizedColumn = camelize(modelColumn);
      let label = ModelUtils.getLabel(type, camelizedColumn);
      let column = {};

      column['label'] = label;
      column['valuePath'] = camelizedColumn;
      column['width'] = (modelColumn === 'id') ? '60px' : undefined;
      column['resizable'] = (modelColumn !== 'id');
      column['cellComponent'] = 'mist-model-table-cell';
      column['sorted'] = queryParams.get('sort') === dasherize(modelColumn);
      column['ascending'] = queryParams.get('dir') === 'asc';

      columns.push(column);
    });

    return columns;
  }),
  isArrayTable: computed('models', function(){
    return this.get('arrayTable');
  }),
  fixed: computed('tableHeight', function(){
    // when a height of the table is passed, we set the column headers fixed
    return !isBlank(this.get('tableHeight'));
  }),

  fetchRecords: task(function * (){
    yield this.get('setListViews').perform();
    const modelType = this.get('activeModelType');
    if(this.get('isArrayTable') || this.get('displaySelected')){
      // this table is an array table, we don't query the store for records
      let models = this.get('displaySelected') ? this.get('selectedModels') : this.get('models');
      let records = [];

      let queryParams = this.get('queryParams');

      // First we filter by Search keyword
      if(!isBlank(queryParams.search)){
        models = models.filter((model) => {
          const modelValueToCompare = model.get(camelize(queryParams.get('searchField')));
          return !isBlank(modelValueToCompare) && StringUtils.wildcardMatch(modelValueToCompare.toUpperCase(), queryParams.search.toUpperCase());
        });
      }

      // Next we sort
      if(!isBlank(queryParams.sort)){
        const sortBy = camelize(queryParams.sort);
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

      // Lets also check if a listview is selected. And pass if to the query if needed
      const activeListView = this.get('activeListView');
      if(this.get('activeListViewKey') !== 'All' && !isBlank(activeListView)){
        queryParams.filter['_listview'] = activeListView.get('id');
      } else {
        delete queryParams.filter['_listview'];
      }

      // Now we can query the store
      yield this.get('store').query(modelType, queryParams).then(records => {
        this.table.setRows(records);
        this.set('mapModels', records);
        let meta = records.get('meta');
        this.set('queryParams.page', isBlank(meta['page-current']) ? 1 : meta['page-current']);
        this.set('lastPage', isBlank(meta['page-count']) ? 1 : meta['page-count']);
        this.set('resultRowFirst', isBlank(meta['result-row-first']) ? 0 : meta['result-row-first']);
        this.set('resultRowLast', isBlank(meta['result-row-last']) ? 0 : meta['result-row-last']);
        this.set('resultTotalCount', isBlank(meta['total-count']) ? 0 : meta['total-count']);
        this.reSetSelected();
      });
    }
    if(isBlank(this.get('table.columns'))){
      this.setColumns();
    }
  }).drop(),

  fetchRecordsAndRefreshColumns: task(function * (){
    yield this.get('fetchRecords').perform();
    // Needed for polymorphic tables
    this.setColumns();
  }).drop(),

  setColumns(){
    this.get('table').setColumns(this.get('columns'));
  },

  setDefaultIncludes(){
    // This method adds the default includes defined on the modeltype, to the queryParams object
    let type = ModelUtils.getModelType(this.get('activeModelType'), this.get('store'));
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

    if(isBlank(activatedIndex)){
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

    if(isBlank(activatedIndex)){
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
    if(isBlank(this.get('onRowSelected'))){
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

      if(!isBlank(location)){
        let marker = location.getMarker('company-map');
        if(!isBlank(marker)){
          marker.setIcon('assets/images/map-marker-red.png');
        }
      }


    }
  },
  rowDeactivateMapMarker(row){
    if(this.get('updateMarkersOnRowHover')){
      let location = row.get('content').getLocation('location');
      if(!isBlank(location)){
        let marker = location.getMarker('company-map');
        if(!isBlank(marker)){
          marker.setIcon('assets/images/map-marker-purple.png');
        }
      }
    }
  },
  deactivateRows(){
    this.get('table.rows').setEach('activated', false);
  },
  getSavedListViewSelection(){
    const listViewGrouping = this.get('listViewGrouping');
    if(!isBlank(listViewGrouping)){
      let listViewSelections = this.get('storage.listViewSelections');
      if(!isBlank(listViewSelections) && listViewSelections.hasOwnProperty(listViewGrouping)){
        return listViewSelections[listViewGrouping];
      }
    }
  },
  saveListViewSelection(){
    const listViewGrouping = this.get('listViewGrouping');
    if(!isBlank(listViewGrouping)){
      let listViewSelections = this.get('storage.listViewSelections');
      if(isBlank(listViewSelections)){
        listViewSelections = {};
      }

      listViewSelections[listViewGrouping] = this.get('activeListViewKey');
      this.set('storage.listViewSelections', listViewSelections);
    }
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
    },
    activeModelTypeChanged(activeModelType){
      this.set('activeModelType', activeModelType);
      this.get('fetchRecordsAndRefreshColumns').perform();
    },
    listViewChanged(newListView){
      this.set('activeListViewKey', newListView);
      if(newListView === 'All'){
        // Default List view
        this.set('activeListView', this.get('defaultModelListView'));
      } else {
        this.set('activeListView', this.get('store').peekRecord('list-view', newListView))
      }
      this.saveListViewSelection();
      this.setQueryParamsBasedOnActiveListView();
      this.get('fetchRecordsAndRefreshColumns').perform();
    }
  }
});
