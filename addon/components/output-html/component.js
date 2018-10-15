import Component from '@ember/component';
import OutputComponent from 'ember-field-components/mixins/component-output';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend(OutputComponent, {
  type: 'html',
  html: computed('value', function(){
    return htmlSafe(this.get('value'));
  })
});
