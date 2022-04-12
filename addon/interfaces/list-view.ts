import MetaModelInterface from './meta-model';
import MutableArray from '@ember/array/mutable';
import FieldInterface from './field';
import ConditionInterface from './condition';
import ModelInterface from './model';
import SortOrderInterface from './sort-order';

export default interface ListViewInterface extends ModelInterface {
  name: string;
  grouping?: string;
  conditionLogic?: string;
  rows?: number;
  sort?: number;

  /* Relationships */
  model: MetaModelInterface;
  columns: MutableArray<FieldInterface>;
  conditions: MutableArray<ConditionInterface>;
  sortOrders: MutableArray<SortOrderInterface>;

  /* Functions */
  conditionsValid(): boolean;
  ordersValid(): boolean;
}
