import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export function loadableModel(desc: any) {
  if(typeof desc === 'function') {
    desc.reopen(LoadableModel);
  } else {
    return {
      ...desc,
      finisher(target: any) {
        target.reopen(LoadableModel);

        return target;
      }
    };
  }
}
