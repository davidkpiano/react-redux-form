import isPlainObject from 'lodash/isPlainObject';

export default function isValid(formState) {
  if (!formState) return true;

  // TODO: deprecate
  if (formState.hasOwnProperty('valid')) return formState.valid;

  if (!formState.$form) {
    const { errors } = formState;

    if (!Array.isArray(errors) && !isPlainObject(errors)) {
      return !!errors;
    }

    return Object.keys(formState.errors).every((errorKey) => {
      const valid = !formState.errors[errorKey];

      return valid;
    });
  }

  return Object.keys(formState).every((key) => {
    console.log(key, isValid(formState[key]));

    return isValid(formState[key]);
  });
}
