import Component from '@ember/component';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import Query from 'ember-mist-components/query/Query';
import Condition from 'ember-mist-components/query/Condition';
import SelectOption from 'ember-field-components/interfaces/SelectOption';
import ListViewService from 'ember-mist-components/services/list-view';
import { dropTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ListViewSelectComponent extends Component {
  @service store !: Store;
  @service router !: any;
  @service intl !: any;
  @service listView !: ListViewService;

  modelName !: string;
  grouping !: string;
  listViewSelectOptions : SelectOption[] = [];

  valueChanged!: (selectOptionValue : any) => void;

  didReceiveAttrs(){
    super.didReceiveAttrs();

    assert('Grouping cannot be blank', !isBlank(this.grouping));
    this.setListViews.perform();
  }

  @computed('router.currentRouteName', 'modelName', 'listViewSelectOptions')
  get selectedValue() : string | number {
    const modelName = this.modelName;
    let selection = this.listView.getActiveListViewKeyForCurrentRoute(modelName);

    const foundSelectOption = this.listViewSelectOptions.findBy('value', selection);
    if(isBlank(foundSelectOption)) {
      selection = 'All';
    }

    return selection;
  }

  @computed('modelName')
  get modelClass() : any {
    return this.store.modelFor(this.modelName);
  }

  @computed('modelClass')
  get defaultListView() : any {
    return this.listView.getDefaultListView(this.modelName);
  }

  @dropTask
  * setListViews() {
    const foundListViews : SelectOption[] = [];

    // Lets add the default List View
    foundListViews.push({
      label: this.intl.t('label.all'),
      value: 'All'
    });

    const query = Query.create({ modelName: 'list-view' });
    query.addCondition(new Condition('grouping', '=', this.grouping));

    yield query.fetch(this.store).then((listViews) => {
      listViews.forEach((listView : Model) => {
        const selectOption : any = {};
        selectOption.value = listView.get('id');
        selectOption.label = listView.get('name');
        foundListViews.push(selectOption);
      });
    });

    this.listViewSelectOptions = foundListViews;
  }

  @action
  selectionChanged(selectOptionValue : any) {
    this.listView.setListViewSelectionForCurrentRoute(this.modelName, selectOptionValue);

    this.valueChanged(selectOptionValue);
  }
}
