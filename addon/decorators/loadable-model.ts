import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export function loadableModel(desc: any) {
  desc.reopen(LoadableModel);
}
