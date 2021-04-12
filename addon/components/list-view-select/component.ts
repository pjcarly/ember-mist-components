import Component from '@glimmer/component';
import Store from '@ember-data/store';
import Query from '@getflights/ember-mist-components/query/Query';
import Condition from '@getflights/ember-mist-components/query/Condition';
import SelectOption from '@getflights/ember-field-components/interfaces/SelectOption';
import ListViewService from '@getflights/ember-mist-components/services/list-view';
import MutableArray from '@ember/array/mutable';
import { dropTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';
import { A } from '@ember/array';
import { taskFor } from 'ember-concurrency-ts';
import { tracked } from '@glimmer/tracking';

interface Arguments {
  modelName: string;
  grouping: string;
  valueChanged: (selectOptionValue: any) => void;
}

export default class ListViewSelectComponent extends Component<Arguments> {
  @service store!: Store;
  @service router!: any;
  @service intl!: any;
  @service listView!: ListViewService;

  @tracked listViewSelectOptions: SelectOption[] = [];

  constructor(owner: any, args: Arguments) {
    super(owner, args);
    assert('Grouping cannot be blank', !isBlank(args.grouping));
    taskFor(this.setListViews).perform();
  }

  get listViewSelectOptionsComputed(): MutableArray<SelectOption> {
    return A(this.listViewSelectOptions);
  }

  get selectedValue(): string | number {
    let selection = this.listView.getActiveListViewKeyForCurrentRoute(
      this.args.modelName
    );

    const foundSelectOption = this.listViewSelectOptionsComputed.findBy(
      'value',
      selection
    );
    if (isBlank(foundSelectOption)) {
      selection = 'All';
    }

    return selection;
  }

  get modelClass(): any {
    return this.store.modelFor(this.args.modelName);
  }

  get defaultListView(): any {
    return this.listView.getDefaultListView(this.args.modelName);
  }

  @dropTask
  async setListViews() {
    const foundListViews: SelectOption[] = [];

    // Lets add the default List View
    foundListViews.push({
      label: this.intl.t('label.all'),
      value: 'All',
    });

    const query = new Query('list-view');
    query.addCondition(new Condition('grouping', '=', this.args.grouping));
    query.setLimit(50);

    await query.fetch(this.store).then((listViews) => {
      listViews.forEach((listView: any) => {
        const selectOption: any = {};
        selectOption.value = listView.id;
        selectOption.label = listView.name;
        foundListViews.push(selectOption);
      });
    });

    this.listViewSelectOptions = foundListViews;
  }

  @action
  selectionChanged(selectOptionValue: any) {
    this.listView.setListViewSelectionForCurrentRoute(
      this.args.modelName,
      selectOptionValue
    );

    this.args.valueChanged(selectOptionValue);
  }
}
