import Component from '@ember/component';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import ListViewService from 'ember-mist-components/services/list-view';
import Query from 'ember-mist-components/query/Query';
import Condition from 'ember-mist-components/query/Condition';
import moment from 'moment';
import { restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { add, isBefore, startOf, endOf, weekday } from 'ember-power-calendar-utils';
import { dasherize } from '@ember/string';
import { assert } from '@ember/debug';
import { isBlank } from '@ember/utils';

export default class ModelCalendarComponent extends Component {
  @service store!: Store;
  @service router !: any;
  @service listView !: ListViewService;

  modelName = '';
  dateField = '';
  extraClassesField = '';
  listViewGrouping = '';
  listViewKey = '';
  loadedModels = [];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  center = new Date();

  didReceiveAttrs(){
    this._super(...arguments);
    this.loadModels.perform();
  }

  /**
   * Loads the Models that need to be displayed from the back-end
   */
  @restartableTask
  * loadModels(this: ModelCalendarComponent) {
    const models = yield this.query.fetch(this.store);
    this.set('loadedModels', models);
  }

  /**
   * Returns a hashmap with as key the date, and value an array of models for that date
   */
  @computed('loadedModels', 'dateField', 'dateFormat')
  get modelsPerDate(): { [key: string]: Array<Model> } {
    const loadedModels = this.get('loadedModels');
    const models : { [key: string]: Array<Model> } = {};

    loadedModels.forEach((model: Model) => {
      const dateValue = model.get(this.dateField);
      const key = moment(dateValue).format('YYYY-MM-DD');
      if(!models.hasOwnProperty(key)){
        models[key] = [];
      }

      models[key].push(model);
    });

    return models;
  }

  /**
   * Returns the correct date format based on the fieldType
   */
  @computed('fieldType')
  get dateFormat(): string {
    let format = '';

    if(this.fieldType === 'date'){
      format = 'YYYY-MM-DD';
    } else {
      format = 'YYYY-MM-DD\THH:mm:ss';
    }

    return format;
  }

  /**
   * Returns the field type of the datefield (this returns either date or datetime)
   */
  @computed('modelName', 'dateField')
  get fieldType(): string {
    const model = this.store.modelFor(this.modelName);
    assert(`Model ${this.modelName} not found.`, !isBlank(model));

    const attributes = model.attributes;
    assert(`Attribute ${this.dateField} not found on ${this.modelName}`, attributes.has(this.dateField));

    const fieldType = attributes.get(this.dateField).type;
    assert(`Type ${fieldType} not supported, only date or datetime allowed`, (fieldType === 'date' || fieldType === 'datetime'));
    return fieldType;
  }

  /**
   * Returns the month of the current centered date
   */
  @computed('center')
  get currentMonth(): number {
    return this.center.getMonth();
  }

  /**
   * Returns the year of the current centered date
   */
  @computed('center')
  get currentYear(): number {
    return this.center.getFullYear();
  }

  /**
   * Returns an array of years that can be selected in the calendars month
   */
  @computed('currentYear')
  get years(): Array<number> {
    const years = [];
    const currentYear = this.currentYear;
    let i = currentYear - 2;

    while(i < currentYear + 5){
      years.push(i++);
    }

    return years;
  }

  /**
   * Returns true if the calendar is centered on the current month
   */
  @computed('center')
  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.center.getFullYear() === now.getFullYear() && this.center.getMonth() === now.getMonth();
  }

  /**
   * Returns all the days in the current calendar display
   */
  @computed('center')
  get days(): Array<Object> {
    const now = new Date();
    const referenceDate = this.center;

    let day = startOf(startOf(referenceDate, 'month'), 'isoWeek');
    const lastDay = endOf(endOf(referenceDate, 'month'), 'isoWeek');
    const days = [];

    while (isBefore(day, lastDay)) {
      const copy = new Date(day);
      const isToday = (copy.getFullYear() === now.getFullYear() && copy.getMonth() === now.getMonth() && copy.getDate() === now.getDate());
      const isCurrentMonth = referenceDate.getFullYear() === copy.getFullYear() && referenceDate.getMonth() === copy.getMonth();
      const isWeekend = (weekday(copy) === 0 || weekday(copy) === 6);
      days.push({
        number: copy.getDate(),
        date: copy,
        isCurrentMonth,
        isToday,
        isWeekend
      });
      day = add(day, 1, "day");
    }
    return days;
  }

  /**
   * Sets the default Query Params
   */
  @computed('modelName', 'center', 'selectedListView')
  get query() : Query {
    const query = Query.create({ modelName: this.modelName });
    query.setLimit(2000);

    const center = this.center;
    const startOfMonth = new Date(center.getFullYear(), center.getMonth(), 1);
    const endOfMonth = new Date(center.getFullYear(), center.getMonth() + 1, 0, 23, 59, 59);

    query.addCondition(new Condition(dasherize(this.dateField), '>=', moment(startOfMonth).format(this.dateFormat)));
    query.addCondition(new Condition(dasherize(this.dateField), '<=', moment(endOfMonth).format(this.dateFormat)));

    if(this.selectedListView) {
      query.setListView(this.selectedListView);
    }

    return query;
  }

  /**
   * This will return the key of the current selected list view value
   */
  @computed('router.currentRouteName', 'modelName', 'listViewKey')
  get selectedListView() : number | undefined {
    const selection = this.listView.getActiveListViewKeyForCurrentRoute(this.modelName);

    if(selection === 'All') {
      return;
    }

    return selection;
  }

  /**
   * Centers the Calendar on the provided date
   * @param date The Date you want to center the calendar on
   */
  centerCalendarOn(this: ModelCalendarComponent, date: Date){
    this.set('center', date);
    this.loadModels.perform();
  }

  /**
   * Centers the calendar on the current date
   */
  @action
  resetToToday(this: ModelCalendarComponent){
    this.centerCalendarOn(new Date());
  }

  /**
   * Ember action to change the center of the calendar by utilising the Ember Power Calendar API
   * @param unit
   * @param calendar
   * @param e
   */
  @action
  changeCenter(this: ModelCalendarComponent, unit: string, calendar: Object, e: Event) {
    const oldCenter = this.center;
    const newCenter = new Date();

    newCenter.setDate(oldCenter.getDate());

    if (unit === 'year') {
      newCenter.setMonth(oldCenter.getMonth());
      newCenter.setFullYear(e.target.value);
    } else if (unit === 'month') {
      newCenter.setMonth(e.target.value);
      newCenter.setFullYear(oldCenter.getFullYear());
    }

    this.centerCalendarOn(newCenter);
  }

  /**
   * Ember action to center the calendar on the given date
   * @param date The date you want to center on
   */
  @action
  setCenter(this: ModelCalendarComponent, date: Date) {
    this.centerCalendarOn(date);
  }

  @action
  listViewChanged(listViewKey: string) {
    this.set('listViewKey', listViewKey);
    this.loadModels.perform();
  }
}
