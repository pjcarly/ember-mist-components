/* global JsBarcode */
import Component from '@ember/component';

export default Component.extend({
  tagName: 'svg',
  didInsertElement(){
    this._super(...arguments);
    JsBarcode(`#${this.get('elementId')}`, this.get('value'), {
      displayValue: false,
      height: 50,
      width: 1
    });
  }
});
