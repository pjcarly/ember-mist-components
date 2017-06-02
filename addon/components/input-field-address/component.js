import Ember from 'ember';
import { task } from 'ember-concurrency';
import { replaceAll } from 'ember-field-components/classes/utils';

const { Component, computed, isBlank, isNone, inject } = Ember;
const { service } = inject;

export default Component.extend({
  tagName: '',
  storage: service(),
  ajax: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.get('initializeAddress').perform();
  },
  clearSelectOptions(){
    this.set('administrativeAreaSelectOptions', null);
    this.set('localitySelectOptions', null);
    this.set('dependentLocalitySelectOptions', null);
    this.set('postalCodeSelectOptions', null);
    this.set('sortingCodeSelectOptions', null);
    this.set('addressLine1SelectOptions', null);
    this.set('addressLine2SelectOptions', null);
    this.set('organizationSelectOptions', null);
    this.set('givenNameSelectOptions', null);
    this.set('additionalNameSelectOptions', null);
    this.set('familyNameSelectOptions', null);
  },
  reRenderRows(editedField){
    const format = this.get('addressFormat');
    const selectlistDepth = format.data.attributes['subdivision-depth'];

    if(selectlistDepth !== 0){
      // only need to be rerendered if there are potential dependent address fields
      const usedFields = format.data.attributes['used-fields']; // this is an array, containing the used fields in the format, sorted from big to small
      const positionOfField = usedFields.indexOf(editedField) +1; // 0-based

      if(positionOfField < selectlistDepth){
        this.get('setDisplayRows').perform();
      }
    }
  },
  resetValues(editedField){
    // here we reset values of address, for fields where parent dependencies change
    const {address, addressFormat} = this.getProperties('address', 'addressFormat');
    const selectlistDepth = addressFormat.data.attributes['subdivision-depth'];

    if(selectlistDepth !== 0){
      // only need to be reset if there are potential dependent address fields
      const usedFields = addressFormat.data.attributes['used-fields']; // this is an array, containing the used fields in the format, sorted from big to small
      const zeroBasedPositionOfField = usedFields.indexOf(editedField);

      if(zeroBasedPositionOfField+1 < selectlistDepth){
        for(let i = zeroBasedPositionOfField+1; i < selectlistDepth; i++){
          address.set(usedFields[i], null);
        }
      }
    }
  },
  getParentGroupingForField(field){
    const {address, addressFormat} = this.getProperties('address', 'addressFormat');
    const usedFields = addressFormat.data.attributes['used-fields']; // this is an array, containing the used fields in the addressFormat, sorted from big to small
    const zeroBasedPositionOfField = usedFields.indexOf(field);

    let parentValues = [];
    parentValues.push(addressFormat.data.attributes['country-code']); // country value is always the first, but not provided in the addressFormat's used fields

    for(let i = 0; i < zeroBasedPositionOfField; i++){
      const parentValue = address.get(usedFields[i]);
      parentValues.push(parentValue);
    }

    return parentValues.join(',');
  },
  initializeAddress: task(function * (){
    this.set('address.countryCode', 'CL');

    yield this.get('setCountrySelectOptions').perform();
    yield this.get('setAddressFormat').perform();
  }),
  setCountrySelectOptions: task(function * (){
    const { storage, ajax } = this.getProperties('storage', 'ajax');
    let cachedCountrySelectOptions = storage.get('addressCountrySelectOptions');

    if(isBlank(cachedCountrySelectOptions)){
      yield ajax.request('/api/meta/address/countries/selectoptions').then((response) => {
        if(!isBlank(response)){
          storage.set('addressCountrySelectOptions', response);
          this.set('countrySelectOptions', response);
        }
      });
    } else {
      this.set('countrySelectOptions', cachedCountrySelectOptions);
    }
  }),
  setAddressFormat: task(function * (){
    const { storage, ajax, address } = this.getProperties('storage', 'ajax', 'address');
    const countryCode = address.get('countryCode');

    // lets clear potential previous selectoptions to start with
    this.clearSelectOptions();

    if(isBlank(countryCode)){
      // no country code is chosen, the address must be cleared
      address.clear();
    } else {
      // first we check the localstorage for the format, we might have it already
      const storageKey = `addressFormat${countryCode}`;
      let cachedAddressFormat = storage.get(storageKey);

      if(isBlank(cachedAddressFormat)){
        // no cached format found, lets request it from the server
        yield ajax.request(`/api/meta/address/format/${countryCode}`).then((response) => {
          storage.set(storageKey, response);
          this.set('addressFormat', response);
        })
      } else {
        this.set('addressFormat', cachedAddressFormat);
      }

      this.get('setDisplayRows').perform();
    }
  }),
  setDisplayRows: task(function * (){
    // here we build the structure the component must be formatted in the template
    // we disect the addressformat, and find out how we must display the individual components
    // - some countries don't use parts of an address
    // - depending on the country, some parts are required, some parts not
    // - depending on the country, a selectlist for certain parts are used (f/e US States)
    // - depending on the country some parts have a different label (state, province, region, island, ...)
    const addressFormat = this.get('addressFormat');
    const rows = [];

    if(!isBlank(addressFormat) && !isBlank(addressFormat.data.attributes.format)){
      const format = addressFormat.data.attributes.format;

      let rawStructurePerLine = format.split('\n');
      for(let rawLine of rawStructurePerLine){
        let rawColumns = rawLine.split(' ');
        let row = {};
        row.columns = [];

        for(let rawColumn of rawColumns){
          rawColumn = rawColumn.replace(/[^0-9a-z]/gi, ''); // we remove all none alpha numeric characters
          let column = yield this.get('getDisplayColumnnForField').perform(rawColumn, addressFormat);
          if(!isBlank(column)){
            row.columns.push(column);
          }
        }

        row.amountOfColumns = row.columns.length;

        if(row.amountOfColumns > 0){
          row.columnClassName = `col-xs-${12/row.amountOfColumns}`;
          rows.push(row);
        }
      }
    }

    this.set('displayRows', rows);
  }),
  getDisplayColumnnForField: task(function * (field, format){
    if(field !== 'familyName' && field !== 'givenName' && field !== 'organization' && field !== 'additionalName'){
      const selectlistDepth = format.data.attributes['subdivision-depth'];
      const requiredFields = format.data.attributes['required-fields'];

      let column = {};
      column.label = format.data.attributes.labels[field];
      column.field = field;

      // lets add a * in case the field is required to complete the address
      if(requiredFields.indexOf(field) !== -1){
        // the field is required
        column.label += ' *';
      }

      // Here we must figure out what type of component to use to display the input field
      if(selectlistDepth === 0){
        // No depth, so everything in the format is just plain text
        column.component = 'input-text';
      } else {
        // We have a depth, meaning there are select options available, so now we must figure out:
        // - if this field is a select field or a plain text field
        // - and if it is a select field, find out if we can display it (if a parent value is filled in)
        //   for example: you can't know the cities, if you don't know the province of the address

        const usedFields = format.data.attributes['used-fields']; // this is an array, containing the used fields in the format, sorted from big to small
        const positionOfField = usedFields.indexOf(field) +1; // 0-based

        if(positionOfField > selectlistDepth){
          // the position is larger than the depth, this is a plain text field
          column.component = 'input-text';
        } else {
          // position is within the depth, now we must figure out if it parent values are filled in so we can display this field
          // and if this field is a plain text field, or a select
          // - some countries have a selectfield on city for example for 1 province, but a plain text for city on another province
          // - South Korea for example

          let isDisabled = false; // is this field disabled (for now)
          if(positionOfField > 1){
            // now it gets really tricky, we must check parents have values before we can make this field editable
            const parentField = usedFields[positionOfField-2]; // remember 0-based
            isDisabled = isBlank(this.get(`address.${parentField}`));
          }

          // this is the top most field, we don't need to mind parent values

          if(!isDisabled){
            let subdivisionSelectOptions = this.get(`${field}SelectOptions`);

            if(isNone(subdivisionSelectOptions)){
              const parentGrouping = this.getParentGroupingForField(field);
              subdivisionSelectOptions = yield this.get('getSubdivisionSelectOptions').perform(parentGrouping);
            }

            if(isBlank(subdivisionSelectOptions)){
              // no select options found, this is just a plain text field
              column.component = 'input-text';
            } else {
              column.none = `-- ${column.label} --`;
              column.component = 'input-select';
              column.selectOptions = subdivisionSelectOptions;
              column.disabled = isDisabled;
            }
          } else {
            // a disabled field, lets only display 1 option, as they will be rerendered anyway
            column.none = `-- ${column.label} --`;
            column.component = 'input-select';
            column.selectOptions = [];
            column.disabled = isDisabled;
          }
        }
      }

      return column;
    }
  }),
  getSubdivisionSelectOptions: task(function * (parentGrouping){
    // a subdivision is basically a generic name for an address component which has selectoptions that need to be fetched
    let selectoptions = [];

    yield this.get('ajax').request(`api/meta/address/subdivisions/${parentGrouping}`).then((response) => {
      if(!isBlank(response) && !isBlank(response.data)){
        for(let subdivision of response.data){
          let selectoption = {};
          selectoption.value = subdivision.attributes['code'];
          selectoption.label = subdivision.attributes['name'];
          if(!isBlank(subdivision.attributes['local-name'])) {
            selectoption.label += ` (${subdivision.attributes['local-name']})`;
          }
          selectoptions.push(selectoption);
        }
      }
    });

    return selectoptions;
  }),
  address: computed('model', 'field', function(){
    let address = this.get('model').getAddress(this.get('field'));
    return address;
  }),
  actions: {
    countryCodeChanged(value) {
      this.get('address').set('countryCode', value);
      this.get('setAddressFormat').perform();
    },
    addressFieldChanged(field, value) {
      this.get('address').set(field, value);
      this.resetValues(field);
      this.reRenderRows(field);
    }
  }
});
