import Transform from 'ember-data/transform';
import { isBlank } from '@ember/utils';

export default class GeolocationTransform extends Transform {
  deserialize(serialized: any | null) {
    const location: any = {};

    if(!isBlank(serialized)) {
      location.lat = serialized.lat;
      location.lng = serialized.lng;
    }

    return location;
  }

  serialize(deserialized: any | null) {
    const serializedLocation: any = {};

    if(!isBlank(deserialized)) {
      serializedLocation['lat'] = deserialized.lat;
      serializedLocation['lng'] = deserialized.lng;
    }

    return serializedLocation;
  }
};
