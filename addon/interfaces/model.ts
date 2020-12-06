export default interface ModelInterface {
  validate(): boolean;
  rollback(): void;
  reload(): void;
}
