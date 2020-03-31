export default interface ModelInterface {
  id: number | string;
  set(property: string, value: any): void;
  get(property: string): any;
  validate(): boolean;
}
