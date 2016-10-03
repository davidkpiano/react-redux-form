import isPlainObject from 'lodash/isPlainObject';

export default function isValid(formState) {
  if (!formState) return true;

  if (!formState.$form) {
    const { errors } = formState;

    if (!Array.isArray(errors) && !isPlainObject(errors)) {
      return !errors;
    }

    return Object.keys(formState.errors).every((errorKey) => {
      const valid = !formState.errors[errorKey];

      return valid;
    });
  }

  return Object.keys(formState)
    .every((key) => isValid(formState[key]));
}

export function fieldsValid(formState) {
  return Object.keys(formState)
    .every((key) => (key === '$form') || isValid(formState[key]));
}
