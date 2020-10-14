import Component from "@ember/component";
import { computed, action } from "@ember/object";
import { isBlank } from "@ember/utils";
import { tagName } from "@ember-decorators/component";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";

@tagName("")
export default class ModelTableControlsComponent extends Component {
  lastPage: number = 0;
  rows: number = 0;

  nextPage() {}
  prevPage() {}
  pageSelected(_: number) {}
  rowsSelected(_: number) {}

  rowSelectOptions: SelectOption[] = [
    {
      value: "10",
      label: "10",
    },
    {
      value: "25",
      label: "25",
    },
    {
      value: "50",
      label: "50",
    },
    {
      value: "100",
      label: "100",
    },
    {
      value: "200",
      label: "200",
    },
  ];

  @computed("lastPage")
  get pageSelectOptions(): SelectOption[] {
    let selectOptions = [
      {
        value: "1",
        label: "1",
      },
    ];

    if (!isBlank(this.lastPage)) {
      for (let i = 2; i <= this.lastPage; i++) {
        selectOptions.push({
          value: i.toString(),
          label: i.toString(),
        });
      }
    }

    return selectOptions;
  }

  @computed("rows")
  get rowsValue(): string {
    return this.rows.toString();
  }

  @action
  goToNextPage() {
    this.nextPage();
  }

  @action
  goToPrevPage() {
    this.prevPage();
  }

  @action
  didSelectPage(page: string) {
    this.pageSelected(parseInt(page));
  }

  @action
  didSelectRows(rows: string) {
    this.rowsSelected(parseInt(rows));
  }
}
