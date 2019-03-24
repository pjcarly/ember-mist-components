import Component from '@ember/component';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import Query from 'ember-mist-components/query/Query';
import Condition from 'ember-mist-components/query/Condition';
import SelectOption from 'ember-field-components/interfaces/SelectOption';
import { dropTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ListViewSelectComponent extends Component {
  @service store !: Store;
  @service storage !: any;
  @service router !: any;
  @service intl !: any;

  modelName !: string;
  grouping !: string;
  listViewSelectOptions : SelectOption[] = [];

  didReceiveAttrs(){
    super.didReceiveAttrs();

    assert('Grouping cannot be blank', !isBlank(this.grouping));

    this.setListViews.perform();
  }

  @computed('router.currentRouteName', 'modelName', 'listViewSelectOptions')
  get selectedValue() : string {
    const currentRoute = this.router.currentRouteName;
    const modelName = this.modelName;

    const listViewSelections = this.storage.get('listViewSelections');
    let selection = 'All';
    if(!isBlank(listViewSelections) && listViewSelections.hasOwnProperty(currentRoute) && listViewSelections[currentRoute].hasOwnProperty(modelName)) {
      selection = listViewSelections[currentRoute][modelName];
    }

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
    const modelClass = this.modelClass;

    assert(`No default list view defined on the modelclass ${this.modelName}`, modelClass.hasOwnProperty('settings') && modelClass.settings.hasOwnProperty('listViews') && modelClass.settings.listViews.hasOwnProperty('default'));
    return modelClass.settings.listViews.default;
  }

  @dropTask
  * setListViews() {
    const foundListViews : SelectOption[] = [];

    // Lets add the default List View
    foundListViews.push({
      label: this.intl.t('label.all'),
      value: 'All'
    });

    const query = new Query('list-view');
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

  valueChanged(selectOptionValue : any) {
    return selectOptionValue;
  }

  @action
  selectionChanged(selectOptionValue : any) {
    const currentRoute = this.router.currentRouteName;
    const modelName = this.modelName;

    let listViewSelections = this.storage.get('listViewSelections');

    if(isBlank(listViewSelections)){
      listViewSelections = {};
    }

    if(!listViewSelections.hasOwnProperty(currentRoute)){
      listViewSelections[currentRoute] = {};
    }

    listViewSelections[currentRoute][modelName] = selectOptionValue;
    this.storage.set('listViewSelections', listViewSelections);

    this.valueChanged(selectOptionValue);
  }
}
