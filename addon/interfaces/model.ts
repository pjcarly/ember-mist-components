import DS from "ember-data";

export default interface ModelInterface {
  id: number | string;
  set(property: string, value: any): void;
  get(property: string): any;
  validate(): boolean;
  isDirty: boolean;
  rollback(): void;
  reload(): void;
  // @ts-ignore
  errors: DS.Errors;
}
