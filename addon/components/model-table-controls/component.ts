import Component from "@glimmer/component";
import { action } from "@ember/object";
import { isBlank } from "@ember/utils";
import SelectOption from "@getflights/ember-field-components/interfaces/SelectOption";

interface Arguments {
  lastPage: number;
  rows: number;
  nextPage: () => void;
  prevPage: () => void;
  pageSelected: (page: number) => void;
  rowsSelected: (page: number) => void;
}

export default class ModelTableControlsComponent extends Component<Arguments> {
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

  get pageSelectOptions(): SelectOption[] {
    let selectOptions = [
      {
        value: "1",
        label: "1",
      },
    ];

    if (!isBlank(this.args.lastPage)) {
      for (let i = 2; i <= this.args.lastPage; i++) {
        selectOptions.push({
          value: i.toString(),
          label: i.toString(),
        });
      }
    }

    return selectOptions;
  }

  get rowsValue(): string {
    return this.args.rows.toString();
  }

  @action
  goToNextPage() {
    this.args.nextPage();
  }

  @action
  goToPrevPage() {
    this.args.prevPage();
  }

  @action
  didSelectPage(page: string) {
    this.args.pageSelected(parseInt(page));
  }

  @action
  didSelectRows(rows: string) {
    this.args.rowsSelected(parseInt(rows));
  }
}
