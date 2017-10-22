import Ember from 'ember';

const { Service } = Ember;
const { inject } = Ember;
const { service } = inject;

export default Service.extend({
  ajax: service()
});
