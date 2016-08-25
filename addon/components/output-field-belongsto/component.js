import Ember from 'ember';
import FieldOutputComponent from 'ember-field-components/mixins/component-field-output-super';
import ModelUtils from 'ember-field-components/classes/model-utils';

export default Ember.Component.extend(FieldOutputComponent, {
  store: Ember.inject.service(),
  link: true,

  parentModelTypeName: Ember.computed('field', 'model', function() {
    let field = this.get('field');
    let model = this.get('model');

    return ModelUtils.getParentModelTypeName(model, field);
  }),

  parentModel: Ember.computed('field', 'model', function() {
    let relationshipType = this.get('parentModelTypeName');
    let relationshipId = this.get('model').get(this.get('field')).get('id');
    let store = this.get('store');

    return store.peekRecord(relationshipType, relationshipId);
  }),

  linkToType: Ember.computed('parentModelTypeName', function() {
    return this.get('parentModelType') + '.view';
  }),

  parentModelType: Ember.computed('parentModelTypeName', function() {
    let parentModelTypeName = this.get('parentModelTypeName');
    return ModelUtils.getModelType(parentModelTypeName, this.get('store'));
  })
});
