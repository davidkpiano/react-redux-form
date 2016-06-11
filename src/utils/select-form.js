import mapValues from './map-values';
import every from 'lodash/every';

function inverse(value) {
  return !value;
}

function mapFields(state, iterator) {
  if (Array.isArray(state)) {
    return state.map(iterator);
  }

  const result = mapValues(state, (field, fieldName) => {
    if (fieldName === '$form') return field;

    return iterator(field, state);
  });

  delete result.$form;

  return result;
}

function formIsValid(formState) {
  const formValid = formState.$form
    ? every(formState.$form.errors, inverse)
    : formState.valid;

  if (!formState.$form) return formValid;

  return every(mapFields(formState, formIsValid))
    && formValid;
}

export default function selectForm(form) {
  if (!form.$form) {
    return form;
  }

  return {
    ...mapFields(form, selectForm),
    $form: {
      ...form.$form,
      get valid() { return formIsValid(form); },
    },
  };
}
