import ModelInterface from "./model";

export default interface DrupalModelInterface extends ModelInterface {
  created?: Date;
  changed?: Date;
}
