import Transform from 'ember-data/transform';
import { isBlank } from '@ember/utils';

export default class AddressTransform extends Transform {
  deserialize(serialized: any | null) {
    const address: any = {};

    if(!isBlank(serialized)) {
      address.countryCode = serialized['country-code'];
      address.administrativeArea = serialized['administrative-area'];
      address.locality = serialized['locality'];
      address.dependentLocality = serialized['dependent-locality'];
      address.postalCode = serialized['postal-code'];
      address.sortingCode = serialized['sorting-code'];
      address.addressLine1 = serialized['address-line1'];
      address.addressLine2 = serialized['address-line2'];
    } else {
      address.countryCode = null;
      address.administrativeArea = null;
      address.locality = null;
      address.dependentLocality = null;
      address.postalCode = null;
      address.sortingCode = null;
      address.addressLine1 = null;
      address.addressLine2 = null;
    }

    return address;
  }

  serialize(deserialized: any | null) {
    const serializedAddress: any= {}

    if(!isBlank(deserialized)) {
      serializedAddress['country-code'] = deserialized.countryCode;
      serializedAddress['administrative-area'] = deserialized.administrativeArea;
      serializedAddress['locality'] = deserialized.locality;
      serializedAddress['dependent-locality'] = deserialized.dependentLocality;
      serializedAddress['postal-code'] = deserialized.postalCode;
      serializedAddress['sorting-code'] = deserialized.sortingCode;
      serializedAddress['address-line1'] = deserialized.addressLine1;
      serializedAddress['address-line2'] = deserialized.addressLine2;
    }

    return serializedAddress;
  }
};
