import Helper from '@ember/component/helper';
import Model from 'ember-data/model';
import { isBlank } from '@ember/utils';

export default class ArrayJoinHelper extends Helper {
  compute([model, belongsToRelationshipName] : [Model, string]) : string | undefined {
    if(isBlank(model)) {
      return;
    }

    return model.belongsTo(belongsToRelationshipName).id();
  }
}
