/* global moment */
import Ember from 'ember';
import FieldInputComponent from 'ember-field-components/mixins/component-field-input-super';
import { padStart, replaceAll } from 'ember-field-components/classes/utils';

export default Ember.Component.extend(FieldInputComponent, {
  computedValue: Ember.computed('value', function(){
    const fieldOptions = this.get('fieldOptions');
    let value = this.get('value');

    if(fieldOptions.minLength && fieldOptions.minLength > 0){
      value = padStart(value, fieldOptions.minLength);
    }

    let prefix = '';
    if(fieldOptions.prefixPattern) {
      // there is a prefix Pattern
      prefix = fieldOptions.prefixPattern;

      // Next we check possible date values to replace
      const created = this.get('model.created');
      if(created){
        const momentDate = moment(created);
        prefix = replaceAll(prefix, '{{YYYY}}', momentDate.format('YYYY'));
        prefix = replaceAll(prefix, '{{YY}}', padStart(momentDate.format('YY'), 2));
        prefix = replaceAll(prefix, '{{QQ}}', padStart(momentDate.format('Q'), 2));
        prefix = replaceAll(prefix, '{{MM}}', padStart(momentDate.format('MM'), 2));
        prefix = replaceAll(prefix, '{{DD}}', padStart(momentDate.format('DD'), 2));
      }
    }

    return `${prefix}${value}`;
  })
});
