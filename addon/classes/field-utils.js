export function transformFieldSelectOptionsToSelectOptions(fieldModel){
  const selectOptions = fieldModel.get('selectOptions');
  const transformedSelectOptions = [];
  if(!Ember.isBlank(selectOptions)){
    for (const key in selectOptions) {
      if (selectOptions.hasOwnProperty(key)) {
        let selectOption = {};
        selectOption.value = key;
        selectOption.label = selectOptions[key];
        transformedSelectOptions.push(selectOption);
      }
    }
  }

  return transformedSelectOptions;
}
