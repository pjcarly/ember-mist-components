export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

export default class Order {
  field !: string;
  direction : Direction = Direction.ASC;

  constructor(field : string, direction : Direction = Direction.ASC) {
    this.field = field;
    this.direction = direction;
  }

  /**
   * Returns a jsonapi.org compliant order string for this sort order
   */
  get orderParam() : string {
    if(this.direction = Direction.ASC) {
      return this.field;
    } else {
      return `-${this.field}`;
    }
  }
}
