import { computed } from '@ember-decorators/object';
import { isBlank } from '@ember/utils';
import OutputFieldComponent from 'ember-field-components/components/output-field/component';
import { inject as service } from '@ember-decorators/service';
import FieldInformationService from 'ember-field-components/services/field-information';
import { FieldOptionsInterface } from 'ember-field-components/services/field-information';

export interface BelongsToFieldOptions extends FieldOptionsInterface {
  polymorphic: boolean;
  filters: any[];
}

export default class OutputFieldBelongstoComponent extends OutputFieldComponent {
  @service fieldInformation !: FieldInformationService;

  @computed('model', 'field')
  get relationshipModelName() : string | string[] {
    if(this.isPolymorphic) {
      return this.fieldInformation.getBelongsToModelNames(this.modelName, this.field);
    }

    return this.fieldInformation.getBelongsToModelName(this.modelName, this.field);
  }

  @computed('fieldOptions')
  get isPolymorphic() : boolean {
    const options = <BelongsToFieldOptions> this.fieldOptions;
    return !isBlank(options) && options.hasOwnProperty('polymorphic') && options.polymorphic;
  }

  @computed('value')
  get relationshipId() : string | undefined {
    if(this.value) {
      return this.value.id;
    }

    return;
  }

  @computed('value')
  get route() : string | undefined {
    return this.value ? `${this.fieldInformation.getModelName(this.value)}.view` : undefined;
  }
}
