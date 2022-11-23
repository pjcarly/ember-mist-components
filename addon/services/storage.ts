import Service from '@ember/service';
import { isNone } from '@ember/utils';

export default class StorageService extends Service {
  private prefix = 'es';
  private _notify!: (evnt: StorageEvent) => void;

  constructor() {
    super(...arguments);

    const regexp = new RegExp(`^(${this.prefix}__)`);

    this._notify = (event) => {
      if (!event.key) {
        return;
      }

      this.notifyPropertyChange(event.key.replace(regexp, ''));
    };

    window.addEventListener('storage', this._notify, false);
  }

  private get storage(): Storage {
    return window.localStorage;
  }

  private _prefix(key: string) {
    return `${this.prefix}__${key}`;
  }

  willDestroy() {
    super.willDestroy();
    window.removeEventListener('storage', this._notify, false);
  }

  public retrieve(k: string): any {
    const key = this._prefix(k);
    // if we don't use JSON.parse here then observing a boolean doesn't work
    return this.storage[key] && JSON.parse(this.storage[key]);
  }

  public persist(k: string, value: any) {
    const key = this._prefix(k);

    if (isNone(value)) {
      delete this.storage[key];
    } else {
      this.storage[key] = JSON.stringify(value);
    }
    this.notifyPropertyChange(k);
    return value;
  }

  public clear(keyPrefix?: string) {
    // @ts-ignore
    this.beginPropertyChanges();

    const prefix = keyPrefix || this.prefix,
      regexp = new RegExp('^(' + prefix + '__)'),
      toDelete = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);

      if (!key) {
        continue;
      }
      // don't nuke *everything* in localStorage... just keys that match our pattern
      if (key.match(regexp)) {
        toDelete.push(key);
      }
    }

    toDelete.forEach((key) => {
      delete this.storage[key];
      key = key.replace(regexp, '');
      this.persist(key, null);
    });

    // @ts-ignore
    this.endPropertyChanges();
  }

  public remove(keyName?: string) {
    // @ts-ignore
    this.beginPropertyChanges();

    let key = this.prefix + '__' + keyName;

    delete this.storage[key];
    this.persist(key, null);

    // @ts-ignore
    this.endPropertyChanges();
  }
}
