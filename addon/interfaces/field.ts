import MetaModelInterface from "./meta-model";
import ModelInterface from "./model";

export default interface FieldInterface extends ModelInterface {
  name: string;
  label: string;
  apiName: string;
  cardinality: number;
  defaultValue?: string;
  selectOptions?: any;

  /* Relationships */
  model: MetaModelInterface;
}
