/* global JsBarcode */
import Ember from 'ember';
const { Component } = Ember;

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
